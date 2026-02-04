import { ChatOpenAI } from "@langchain/openai";
import { iTextGenerate } from "src/domain/interfaces/iTextGenerate.js";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

export class OpenAIAdapter implements iTextGenerate {
    //Este adapter es el que se encarga de generar el texto de respuesta.
    //Utiliza el modelo de OpenAI para generar el texto.
    //El sistema prompt es el que se encarga de definir el comportamiento del modelo.
    //El contexto es el que se encarga de proporcionar el contexto de la conversacion.
    //La pregunta es la que se encarga de la pregunta del usuario.
    private model = new ChatOpenAI({
        model: "gpt-4o-mini",
        temperature: 0,
        apiKey: process.env.OPENAI_API_KEY,
      });
    
    async generate(system: string, context: string, question: string): Promise<string> {
      const messages = [
        new SystemMessage(system),
        new SystemMessage(`Contexto:\n${context}`),
        new HumanMessage(question),
      ];

      const res = await this.model.invoke(messages);
      return res.content as string;
    }
}