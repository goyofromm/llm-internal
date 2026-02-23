import fs from "fs";
import path from "path";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { OpenAIEmbeddings } from "@langchain/openai";
import { Chroma } from "@langchain/community/vectorstores/chroma";
import { CSVLoader } from "@langchain/community/document_loaders/fs/csv";
import { Document } from "langchain/document";
import 'dotenv/config';

export async function ingest() {
  const embeddings = new OpenAIEmbeddings({
    model: "text-embedding-3-small",
    apiKey: process.env.OPENAI_API_KEY,
  });

  const docsPath = process.env.DOCS_PATH || path.join(__dirname, "../docs");

  if (!fs.existsSync(docsPath)) {
    console.error(`❌ La carpeta no existe: ${docsPath}`);
    return;
  }

  const files = fs.readdirSync(docsPath);
  let allDocs: Document[] = [];

  for (const file of files) {
    const fullPath = path.join(docsPath, file);
    if (fs.lstatSync(fullPath).isDirectory()) continue;
    
    console.log("📂 Leyendo:", fullPath);
    allDocs.push(...await loadDocument(fullPath));
  }

  if (allDocs.length === 0) {
    console.log("⚠️ No se encontraron documentos para procesar.");
    return;
  }

  console.log(`📄 Total páginas cargadas: ${allDocs.length}`);

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 800,
    chunkOverlap: 150,
  });

  const splitDocs = await splitter.splitDocuments(allDocs);
  console.log(`✂️ Se generaron ${splitDocs.length} chunks`);

  const chroma = new Chroma(embeddings, {
    collectionName: "internal-docs",
    url: process.env.CHROMA_URL || "http://chroma:8000",
  });

  try {
    console.log("🧹 Limpiando colección...");
    await chroma.delete({ filter: {} }); 
  } catch (e) {
    console.log("Nota: No se pudo borrar (quizás la colección está vacía).");
  }

  await chroma.addDocuments(splitDocs);
  console.log("✅ Documentos indexados correctamente");
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
