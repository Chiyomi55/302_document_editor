import { NextResponse } from "next/server";
import { generateIllustration } from "./generateIllustration";
import { onSearchImage } from "./service";
export const runtime = "edge";

export async function POST(req: Request) {
    const params = await req.json();
    const api_key = process.env.NEXT_PUBLIC_API_KEY;
    const { content, type, searchType } = params;
    if (type === 'searchImage') {
        try {
            const images = await onSearchImage({ searchType, api_key, query: content });
            return NextResponse.json({ images });
        } catch (error) {
            if (error.response) {
                // 尝试从响应中解析错误信息
                try {
                    const errorData = await error.response.json();
                    return NextResponse.json(errorData);
                } catch (parseError) {
                    return NextResponse.json({ error: parseError });
                }
            } else {
                return NextResponse.json({ error: error.message });
            }
        }
    }
    const data = await generateIllustration(params);
    return NextResponse.json(data);
}

