import OpenAI from "openai";
import config from "config";

const openai = new OpenAI({
  apiKey: config.get("OPEN_AI_API_KEY"),
  baseURL: "https://api.proxyapi.ru/openai/v1",
});

export const useOpenAi = async (messages, model = "gpt-3.5-turbo") => {
  try {
    const completion = await openai.chat.completions.create({
      model,
      messages,
    });
    return completion.choices[0].message;
  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    throw error;
  }
};
