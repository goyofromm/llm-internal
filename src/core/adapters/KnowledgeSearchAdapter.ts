  import { OpenAIEmbeddings } from '@langchain/openai';
  import { iKnowledgeSearch } from '../../domain/interfaces/iKnowledgeSearch.js';
  import { Chroma } from '@langchain/community/vectorstores/chroma';

  /**
   * Returns context from internal docs relevant to the query.
   * Output is used by the use case to call the LLM.
   * TODO: 1) Embed query 2) Vector search 3) Rank/score 4) Concatenate chunks
   */
  export class KnowledgeSearchAdapter implements iKnowledgeSearch {
    private embeddings: OpenAIEmbeddings;
    private vectorStore: Chroma;

    constructor() {
      this.embeddings = new OpenAIEmbeddings({
        model: "text-embedding-3-small",
        apiKey: process.env.OPENAI_API_KEY,
      });
    }

    private async getStore() {
      if (!this.vectorStore) {
        this.vectorStore = await Chroma.fromExistingCollection(
          this.embeddings,
          {
            collectionName: "internal-docs",
            url: "http://127.0.0.1:8000",
          }
        );
      }
    
      return this.vectorStore;
    }


    async search(query: string): Promise<string> {
      const store = await this.getStore();
    
      const results = await store.similaritySearchWithScore(query, 5);
    
      const relevant = results
        .sort((a, b) => a[1] - b[1])
        .filter(([_, score]) => score < 1.2)
        .map(([doc]) => doc.pageContent);
    
      return relevant.join("\n\n---\n\n");
    }
  }


