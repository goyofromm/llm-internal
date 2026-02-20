import { iKnowledgeSearch } from '../../domain/interfaces/iKnowledgeSearch.js';
import type { iTextGenerate } from '../../domain/interfaces/iTextGenerate.js';

const SYSTEM_PROMPT =
  'You are an internal enterprise assistant. Answer only using the provided context. If the context does not contain enough information, say so.';

interface AnswerSystemQuestionBuilder {
  searchKnowledge: iKnowledgeSearch;
  textGenerate: iTextGenerate;
}

export class AnswerSystemQuestion {
  private searchKnowledge: iKnowledgeSearch;
  private textGenerate: iTextGenerate;

  constructor(builder: AnswerSystemQuestionBuilder) {
    this.searchKnowledge = builder.searchKnowledge;
    this.textGenerate = builder.textGenerate;
  }

  async execute(question: string): Promise<string> {
    const context = await this.searchKnowledge.search(question);
    return this.textGenerate.generate(SYSTEM_PROMPT, context, question);
  }
}