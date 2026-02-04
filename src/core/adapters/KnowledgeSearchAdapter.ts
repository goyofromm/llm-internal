import { ChatOpenAI } from "@langchain/openai";
import { iKnowledgeSearch } from "src/domain/interfaces/iKnowledgeSearch.js";
import { OpenAIAdapter } from "./OpenAIAdapter.js";

export class KnowledgeSearchAdapter implements iKnowledgeSearch {
  //Devuelve el contexto de las documentaciones internas que son relevantes para la consulta. 
  //Lo que devuelve va al LLM para que genere la respuesta.
  private openAIAdapter = new OpenAIAdapter()
  async search(query: string): Promise<string> {
    // 1. Embedding del query
    // 2. Vector search en documentación interna
    // 3. Ranking / score
    // 4. Concatenar chunks relevantes

    return this.openAIAdapter.generate('Sos un consultor de info', '', query);
  }
}

