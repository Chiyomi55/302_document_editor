import { NextResponse } from "next/server";
import OpenAI from "openai";
import { generate } from "./service";
export const runtime = "edge";

export async function generateIllustration(params: {
    content: string;
    api_key: string;
    model: string;
    type: string;
    size: string
}) {
    const { content, type, size } = params;
    const fetchUrl = `${process.env.NEXT_PUBLIC_API_URL}/v1`
    const api_key = process.env.NEXT_PUBLIC_API_KEY;
    const model = process.env.NEXT_PUBLIC_MODEL_NAME;
    const openai = new OpenAI({
        apiKey: api_key,
        baseURL: fetchUrl,
    });

    const prompt = `write an image generation prompt based on the provided text, the prompt must related to the origin content and assist user to understand the content.

You should describe the view of the prompt in detailed and accurately, and you should add some parts if the provided prompt is too simple. You can use some famous IP names if needed.

the view of the image must be concise and focus the point, you can reference the illustrations of news, report or blogs.

use simple sentences to describe the view, do not over-describe and use some abstract vocabularies. the best pritice is illustration or charts style for the content.

return the prompt and the best aspect ratio of the image, following the schema:

{
  aspect_ratio: string; // aspect ratio, eg. ASPECT_1_1 ASPECT_10_16 ASPECT_16_10 ASPECT_9_16 ASPECT_16_9 ASPECT_3_2 ASPECT_2_3 ASPECT_4_3 ASPECT_3_4 ASPECT_1_3 ASPECT_3_1
  design_idea: string;  // introduce how do you plan to design the prompt
  prompt: string;  // text of the prompt
}

Following is the input content:
<text>
${content}
</text>`+ "Always return the result in English in plain text format, do not add any other contents. Do not wrapped the JSON in code block with '```json' and '```'."
    let index = 1;
    const getIllustrationPrompt = async () => {
        try {
            const response = await openai.chat.completions.create({
                model,
                stream: false,
                messages: [{ role: "user", content: prompt }],
                temperature: 0.7,
                top_p: 1,
                frequency_penalty: 0,
                presence_penalty: 0,
                n: 1,
            });

            const illustrationPrompt = response?.choices[0]?.message?.content;
            if (!illustrationPrompt) {
                index++;
                await getIllustrationPrompt();
            } else {
                try {
                    const validJsonString = illustrationPrompt.replace(/(\w+):/g, '"\$1":');
                    const data = JSON.parse(validJsonString) as { aspect_ratio: string, prompt: string };
                    if (!data?.prompt || !data?.aspect_ratio) {
                        index++;
                        return await getIllustrationPrompt();
                    } else {
                        const illustration = await generate(type, api_key, size, { ...data });
                        return illustration;
                    }
                } catch (error) {
                    if (index === 3) {
                        if (error.response) {
                            try {
                                const errorData = await error.response.json();
                                return errorData;
                            } catch (parseError) {
                                return { error: parseError }
                            }
                        } else {
                            return { error: error.message }
                        }
                    }
                    index++;
                    return await getIllustrationPrompt();
                }
            }
        } catch (error) {
            if (index === 3) {
                return error
            }
            index++;
            return await getIllustrationPrompt();
        }
    }
    const data = await getIllustrationPrompt()
    // return NextResponse.json(data)
    return data;
}
