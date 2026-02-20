import { OpenAIEmbeddings } from "@langchain/openai";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import path from "path";
import "dotenv/config";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { Chroma } from "@langchain/community/vectorstores/chroma";

export async function ingest() {
  const embeddings = new OpenAIEmbeddings({
    model: "text-embedding-3-small",
    apiKey: process.env.OPENAI_API_KEY,
  });

  // 🔹 Ruta del PDF
  const pdfPath = path.join(
    process.cwd(),
    "src",
    "core",
    "scripts",
    "docs",
    "DOCUMENTACION-MASIVA.pdf"
  );

  console.log("📂 Leyendo:", pdfPath);

  // 🔹 Cargar PDF con loader oficial
  const loader = new PDFLoader(pdfPath);
  const docs = await loader.load();

  console.log(`📄 Se cargaron ${docs.length} páginas del PDF`);

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 800,
    chunkOverlap: 150,
  });
  
  const splitDocs = await splitter.splitDocuments(docs);
  
  console.log(`✂️ Se generaron ${splitDocs.length} chunks`);
  
  await Chroma.fromDocuments(
    splitDocs,
    embeddings,
    {
      collectionName: "internal-docs",
      url: "http://127.0.0.1:8000",
    }
  );
  
  console.log("✅ PDF indexado correctamente");
}

ingest().catch(console.error);

//docker run -p 8000:8000 chromadb/chroma:0.4.24
//npx tsx ./src/core/scripts/Ingest.ts
//npm run start:dev
