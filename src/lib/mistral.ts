import { Mistral } from "@mistralai/mistralai";

const apiKey = process.env.MISTRAL_API_KEY!;

export const mistral = new Mistral({ apiKey });

export async function chatCompletion(
  messages: { role: "system" | "user" | "assistant"; content: string }[],
  model: string = "mistral-large-latest"
) {
  const response = await mistral.chat.complete({
    model,
    messages,
  });
  return response.choices?.[0]?.message?.content ?? "";
}
