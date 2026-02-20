export interface iKnowledgeSearch {
  search(query: string): Promise<string>;
}