import fs from "fs";
import path from "path";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { OpenAIEmbeddings } from "@langchain/openai";
import { Chroma } from "@langchain/community/vectorstores/chroma";
import { CSVLoader } from "@langchain/community/document_loaders/fs/csv";
import 'dotenv/config';
export async function ingest() {
    const embeddings = new OpenAIEmbeddings({
        model: "text-embedding-3-small",
        apiKey: process.env.OPENAI_API_KEY,
    });
    const docsPath = process.env.DOCS_PATH || path.join(__dirname, "docs");
    const files = fs.readdirSync(docsPath);
    let allDocs = [];
    for (const file of files) {
        const fullPath = path.join(docsPath, file);
        console.log("📂 Leyendo:", fullPath);
        allDocs.push(...await loadDocument(fullPath));
    }
    console.log(`📄 Total páginas cargadas: ${allDocs.length}`);
    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 800,
        chunkOverlap: 150,
        separators: ["\n\n", "\n", ".", " ", ""],
    });
    const splitDocs = await splitter.splitDocuments(allDocs);
    console.log(`✂️ Se generaron ${splitDocs.length} chunks`);
    const chroma = new Chroma(embeddings, {
        collectionName: "internal-docs",
        url: "http://chroma:8000",
    });
    await chroma.delete({});
    await chroma.addDocuments(splitDocs);
    console.log("✅ Documentos indexados correctamente");
}
async function loadDocument(filePath) {
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
async function loadPDF(filePath) {
    const loader = new PDFLoader(filePath);
    const docs = await loader.load();
    docs.forEach(doc => {
        doc.metadata.source = filePath;
    });
    return docs;
}
async function loadCSV(filePath) {
    const loader = new CSVLoader(filePath);
    const docs = await loader.load();
    docs.forEach(doc => {
        doc.metadata.source = filePath;
    });
    return docs;
}
ingest().catch(console.error);
//# sourceMappingURL=Ingest.js.map