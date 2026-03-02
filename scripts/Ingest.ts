import fs from "fs";
import path from "path";
import crypto from "crypto";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { OpenAIEmbeddings } from "@langchain/openai";
import { Chroma } from "@langchain/community/vectorstores/chroma";
import { CSVLoader } from "@langchain/community/document_loaders/fs/csv";
import { Document } from "langchain/document";
import 'dotenv/config';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Genera un hash del archivo para detectar cambios
function getFileHash(filePath: string): string {
  const fileBuffer = fs.readFileSync(filePath);
  return crypto.createHash("md5").update(fileBuffer).digest("hex");
}

export async function ingest() {
  const embeddings = new OpenAIEmbeddings({
    model: "text-embedding-3-small",
    apiKey: process.env.OPENAI_API_KEY,
  });

  const docsPath = process.env.DOCS_PATH || path.join(__dirname, "../docs");
  
  // Inicializamos el vector store
  const vectorStore = new Chroma(embeddings, {
    collectionName: "internal-docs",
    url: process.env.CHROMA_URL || "http://chroma:8000",
  });

  // 1. Acceder a la colección nativa para obtener los metadatos
  // Usamos ensureCollection() para asegurarnos de que la conexión esté lista
  const collection = await vectorStore.ensureCollection();
  const response = await collection.get(); // Este es el .get() nativo de Chroma
  
  const existingSources = new Map<string, string>();
  if (response.metadatas) {
    response.metadatas.forEach((meta: any) => {
      if (meta.source && meta.hash) {
        existingSources.set(meta.source, meta.hash);
      }
    });
  }

  // 2. Leer archivos locales
  const files = fs.readdirSync(docsPath).filter(f => 
    [".pdf", ".csv"].includes(path.extname(f).toLowerCase())
  );

  console.log(`📊 Archivos en carpeta: ${files.length} | Archivos en BD: ${new Set(existingSources.keys()).size}`);

  // 3. Eliminar archivos que ya no están en la carpeta
  const localFullPaths = files.map(f => path.resolve(path.join(docsPath, f)));
  for (const source of existingSources.keys()) {
    if (!localFullPaths.includes(source)) {
      console.log(`🗑️ Eliminando archivo inexistente: ${path.basename(source)}`);
      await vectorStore.delete({ filter: { source: source } });
    }
  }

  // 4. Procesar nuevos o modificados
  const splitter = new RecursiveCharacterTextSplitter({ chunkSize: 800, chunkOverlap: 150 });

  for (const file of files) {
    const fullPath = path.resolve(path.join(docsPath, file));
    const currentHash = getFileHash(fullPath);
    const oldHash = existingSources.get(fullPath);

    if (currentHash === oldHash) {
      console.log(`⏩ Sin cambios: ${file}`);
      continue;
    }

    if (oldHash) {
      console.log(`♻️ Actualizando: ${file}`);
      await vectorStore.delete({ filter: { source: fullPath } });
    } else {
      console.log(`🆕 Nuevo archivo: ${file}`);
    }

    const rawDocs = await loadDocument(fullPath);
    const splitDocs = await splitter.splitDocuments(rawDocs);

    splitDocs.forEach(doc => {
      doc.metadata.source = fullPath;
      doc.metadata.hash = currentHash;
    });

    await vectorStore.addDocuments(splitDocs);
    console.log(`✅ Indexado: ${file}`);
  }
}

async function loadDocument(filePath: string) {
  const ext = path.extname(filePath);

  switch (ext) {
    case ".pdf":
      return await loadPDF(filePath);
    case ".csv":
      return await loadCSV(filePath);
    default:
      throw new Error("Formato no soportado");
  }
}

async function loadPDF(filePath: string) {
  const loader = new PDFLoader(filePath);
  const docs = await loader.load();
  docs.forEach(doc => {
    doc.metadata.source = filePath;
  });
  return docs;
}

async function loadCSV(filePath: string) {
  const loader = new CSVLoader(filePath);
  const docs = await loader.load();
  docs.forEach(doc => {
    doc.metadata.source = filePath;
  });
  return docs;
}

ingest().catch(console.error);

//docker exec -it backend npx tsx scripts/Ingest.ts
//docker-compose up -d --build api
