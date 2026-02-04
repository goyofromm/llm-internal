import { iKnowledgeSearch } from "src/domain/interfaces/iKnowledgeSearch.js";

interface AnswerSystemQuestionBuilder {
  searchKnowledge: iKnowledgeSearch
}

export class AnswerSystemQuestion {
  private searchKnowledge: iKnowledgeSearch;

  constructor(builder: AnswerSystemQuestionBuilder) {
    this.searchKnowledge = builder.searchKnowledge;
  }
  
    async execute(question: string): Promise<string> {
      return this.searchKnowledge.search(question);
    }
  }