import { OpenAIStream, StreamingTextResponse } from "ai";
import { NextResponse } from "next/server";
import OpenAI from "openai";
import { articleGeneration } from "../informationSearch/service";
import { cueWord } from "../cueWord";
export const runtime = "edge";

export async function POST(req: Request) {
  const { prompt: content, type, params, isStream = true } = await req.json();
  const api_key = process.env.NEXT_PUBLIC_API_KEY;
  const model = process.env.NEXT_PUBLIC_MODEL_NAME;
  const fetchUrl = `${process.env.NEXT_PUBLIC_API_URL}/v1`
  const openai = new OpenAI({ apiKey: api_key, baseURL: fetchUrl });
  try {
    if (type === 'articleGeneration') {
      const result = await articleGeneration({ api_key, model, ...params });
      if ('error' in result) {
        return NextResponse.json(result, { status: 400 })
      }
      return result;
    } else {
      let messages = cueWord[type]({ content, ...params } as any);
      if (type === 'generate content') {
        const response = await openai.chat.completions.create({
          model,
          stream: false,
          messages,
          temperature: 0.7,
          top_p: 1,
          frequency_penalty: 0,
          presence_penalty: 0,
          n: 1,
        });
        if (response?.choices[0]?.message?.content) {
          const output = response.choices[0].message.content;
          messages = [...messages, { role: "assistant", content: output }].concat(cueWord[`${type}2`]({ ...params }));
        }
      }
      const response = await openai.chat.completions.create({
        model,
        stream: isStream,
        messages,
        temperature: 0.7,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
        n: 1,
      });
      if (isStream) {
        const stream = OpenAIStream(response);
        return new StreamingTextResponse(stream);
      }
      if (response?.choices[0]?.message?.content) {
        const output = response.choices[0].message.content;
        return NextResponse.json(output)
      }
      return NextResponse.json('')
    }
  } catch (error) {
    if (error.response) {
      try {
        const errorData = await error.response.json();
        return NextResponse.json(errorData, { status: error.status })
      } catch (parseError) {
        return NextResponse.json({ error: parseError }, { status: error.status })
      }
    } else {
      return NextResponse.json({ error: error.error }, { status: error.status });
    }
  }
}
