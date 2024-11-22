import { OpenAIStream, StreamingTextResponse } from "ai";
import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/index.mjs";
import { match } from "ts-pattern";
import { NextResponse } from 'next/server';

export const runtime = "edge";

export async function POST(req: Request): Promise<Response> {
  const { prompt, type, language, command } = await req.json();
  const api_key = process.env.NEXT_PUBLIC_API_KEY;
  const model = process.env.NEXT_PUBLIC_MODEL_NAME;
  const fetchUrl = `${process.env.NEXT_PUBLIC_API_URL}/v1`

  const openai = new OpenAI({
    apiKey: api_key,
    baseURL: fetchUrl,
  });

  const messages = match(type)
    // summary
    .with("summary", () => [
      {
        role: "user",
        content: `You are a helpful assistant which can help me to summarize content.
You should detect language of the input content before your action, the result language must same as the input content.
You must summrize the content into a short, concise sentence.
You must output the result directly, do not add explanations and notes.

Following is the input content:"""
${prompt}
"""`
      },
    ])
    // Continued writing
    .with("continued writing", () => [
      {
        role: "user",
        content: `You are a helpful assistant which expert in content continuation.
You can continue the sentence which user provided, generate a high quality result in your own words.
Ensure that the content flows naturally and avoids an AI-generated feel.
You must return the result in plain text, the result language must same as the input content.
Before your task, you should detect the language of the input content.
Return the result directly, never add explanations and notes.

Following is the input content:"""
${prompt}
"""`
      },
    ])
    // rewrite
    .with("rewrite", () => [
      {
        role: "user",
        content: `You are a helpful assistant which expert in rewrite content.
You can rewrite the content to a high quality and professional version.
Before your action, you should detect language of the input content, the result language must same as the input content.
Return the result directly, never add explantions and notes.

Following is the input content:"""
${prompt}
"""`,
      },
    ])
    // abbreviation
    .with("abbreviation", () => [
      {
        role: "user",
        content: `You are a helpful assistant which expert in content reduction.
You can shorten the long content into a minimalist and concise one with your own words, make sure that is the best version.
Before your action, you should detect language of the input content, the result language must same as the input content.
Return the result directly, never add explantions and notes.

Following is the input content:"""
${prompt}
"""`
      },
    ])
    // expand a written article
    .with("expand written article", () => [
      {
        role: "user",
        content: `You are a helpful assistant which expert in expanding content.
You can expand a short content to a longer, detailed version in your own words.
Ensure that the content flows naturally and avoids an AI-generated feel.
Before your action, you should detect language of the input content, the result language must same as the input content.
Return the result directly, never add explantions and notes.

Following is the input content:"""
${prompt}
"""`
      }
    ])
    // translate
    .with("translate", () => [
      {
        role: "user",
        content: `You are a helpful assistant which expert in translate content into any languages fluently.
You must return the best quality version, ensure that the content flows naturally and avoids an AI-generated feel.
Before your action, you should detect language of the input content.
The target language is ${language}.
If the content's language same as the target language, you should return the original content directly.
You must keep the markdown format as same as the original content.
Return the result directly, never add explantions, greetings and notes.

Following is the input content you need to translate:"""
${prompt}
"""`
      },
    ])
    // Free rewriting
    .with("free rewriting", () => [
      {
        role: "user",
        content: `You are a helpful assistant which can help me to modify my text.
Before your action, you should detect language of the input content.
If i do not specific the target language, the result language must same as the input content.
You must output the result directly, do not add explanations and notes.
I will give you a modification request, you must follow it and modify the text in your own words.

Following is the input content:"""
${prompt}
"""

My modification request is: ${command}.
`
      },
    ])
    // Generate Title
    .with("generate title", () => [
      {
        role: "user",
        content: `You are a helpful assistant which can generate a high quality title for a article.
Before your action, you should detect the language of the input content.
Then generate a title for this content into the language detected, the title should be professional and concise.
Return the plain text result directly, do not add explanations and notes.

----- Following is the input content -----
${prompt}
----- Above is the input content -----
`
      },
    ])
    .run() as ChatCompletionMessageParam[];

  try {
    const response = await openai.chat.completions.create({
      model,
      stream: true,
      messages,
      temperature: 0.7,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
      n: 1,
    });
    const stream = OpenAIStream(response);
    return new StreamingTextResponse(stream);
  } catch (error) {
    console.log('================error', error);
    return NextResponse.json(error.error, { status: error.status });
  }
}
