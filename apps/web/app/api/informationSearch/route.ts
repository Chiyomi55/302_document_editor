import { NextResponse } from "next/server";
import { articleGeneration, contentSummary, searchList } from "./service";

export async function POST(req: Request) {
    const { query, type, language, url, template, searchType } = await req.json();
    const api_key = process.env.NEXT_PUBLIC_API_KEY;
    const model = process.env.NEXT_PUBLIC_MODEL_NAME;
    try {
        // Execute search list and recommend keywords
        if (type === 'search') {
            const result = await searchList({ api_key, model, query, language, searchType })
            if ('error' in result.recommendedList) {
                return NextResponse.json(result.recommendedList)
            }
            return NextResponse.json(result)
        }
        // Executive Summary
        if (type === 'contentSummary') {
            const result = await contentSummary({ api_key, model, url: url[0] })
            if ('error' in result) {
                return NextResponse.json(result, { status: 400 })
            }
            return result;
        }
        // Execute article generation
        if (type === 'articleGeneration') {
            const result = await articleGeneration({ api_key, model, language, urls: url, template })
            if ('error' in result) {
                return NextResponse.json(result, { status: 400 })
            }
            return result;
        }
    } catch (error) {
        if (error.response) {
            try {
                const errorData = await error.response.json();
                return NextResponse.json(errorData)
            } catch (parseError) {
                return NextResponse.json({ error: parseError })
            }
        } else {
            return NextResponse.json({ error: error.message })
        }
    }

}
