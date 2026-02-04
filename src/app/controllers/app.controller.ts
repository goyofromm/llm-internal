import { Body, Controller, Get, Post } from '@nestjs/common';
import { AnswerSystemQuestion } from '../../core/interactors/AnswerSystemQuestion.js';

@Controller('/chat')
export class AppController {
  constructor(private readonly answerSystemQuestion: AnswerSystemQuestion) {}

  @Post('/ask')
  async ask(@Body() body: { prompt?: string }) {
    if (!body.prompt) {
      throw new Error('Falta el campo prompt');
    }

    return {
      answer: await this.answerSystemQuestion.execute(body.prompt),
    };
  }
}
