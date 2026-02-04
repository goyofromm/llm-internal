export interface iTextGenerate {
    generate(
      systemPrompt: string,
      context: string,
      question: string
    ): Promise<string>;
  }