import { Module } from '@nestjs/common';
import { AppController } from '../controllers/app.controller.js';
import { iKnowledgeSearch } from '../../domain/interfaces/iKnowledgeSearch.js';
import type { iTextGenerate } from '../../domain/interfaces/iTextGenerate.js';
import { AnswerSystemQuestion } from '../../core/interactors/AnswerSystemQuestion.js';
import { KnowledgeSearchAdapter } from '../../core/adapters/KnowledgeSearchAdapter.js';
import { OpenAIAdapter } from '../../core/adapters/OpenAIAdapter.js';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [
    {
      provide: 'iKnowledgeSearch',
      useClass: KnowledgeSearchAdapter
    },
    {
      provide: 'iTextGenerate',
      useClass: OpenAIAdapter
    },
    {
      provide: AnswerSystemQuestion,
      useFactory: (
        searchKnowledge: iKnowledgeSearch,
        textGenerate: iTextGenerate,
      ) =>
        new AnswerSystemQuestion({
          searchKnowledge,
          textGenerate,
        }),
      inject: ['iKnowledgeSearch', 'iTextGenerate'],
    },
  ],
})
export class AppModule {}