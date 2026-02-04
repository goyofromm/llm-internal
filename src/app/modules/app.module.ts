import { Module } from '@nestjs/common';
import { AppController } from '../controllers/app.controller.js';
import { iKnowledgeSearch } from '../../domain/interfaces/iKnowledgeSearch.js';
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
      useFactory: async (
        searchKnowledge: iKnowledgeSearch,
      ) => {
        return new AnswerSystemQuestion({
          searchKnowledge
        });
      },
      inject: [
        'iKnowledgeSearch'
      ],
    },
  ],
})
export class AppModule {}