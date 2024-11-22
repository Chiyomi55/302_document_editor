import ky from "ky";
import { NextResponse } from "next/server";

interface IPdfAsyncResultError {
  error: {
    err_code: number;
    message: string;
    message_cn: string;
    message_jp: string;
    type: string;
  }
}

interface IPdfAsyncResultSuccess extends IPdfAsyncResultError {
  code: string,
  data: {
    pages: number,
    remain: number,
    uid: string,
    uuid: string
  }
}

type IPdfAsyncResult = IPdfAsyncResultSuccess;

export async function POST(req: Request): Promise<Response> {
  try {
    const formDataParams = await req.formData();
    const file = formDataParams.get('file');
    // const apiKey = formDataParams.get('apiKey') as string;
    const apiKey = process.env.NEXT_PUBLIC_API_KEY;

    const fromData = new FormData();
    fromData.append('file', file);
    fromData.append('ocr', 'true')
    const pdfAsync = await ky(`${process.env.NEXT_PUBLIC_API_URL}/doc2x_v2/api/v2/parse/pdf`, {
      body: fromData,
      timeout: false,
      method: 'post',
      headers: {
        "Authorization": `Bearer ${apiKey}`
      }
    })

    const pdfAsyncResult = await pdfAsync.json() as IPdfAsyncResult
    if (pdfAsyncResult?.data && (pdfAsyncResult?.data?.uid || pdfAsyncResult?.data?.uuid)) {
      const uuid = pdfAsyncResult.data.uid || pdfAsyncResult.data.uuid;
      let data = "";
      const onConversion = async () => {
        const conversionResults: any = await getStatus(apiKey, uuid);
        if (conversionResults?.data?.status === 'failed' || conversionResults?.error) {
          return { ...conversionResults }
        }
        if (conversionResults?.data?.status !== 'success') {
          await new Promise(resolve => setTimeout(resolve, 3000));
          return onConversion();
        } else {
          if (conversionResults?.data?.result?.pages) {
            const { pages } = conversionResults.data.result;
            for (let index = 0; index < pages.length; index++) {
              const { md } = pages[index];
              if (md) {
                data += md
              }
            }
          }
          const markdown = convertImgTagToMarkdown(data)
          return { data: markdown, status: 200 }
        }
      }
      const result = await onConversion();
      return NextResponse.json({ ...result })
    } else {
      return NextResponse.json({ pdfAsyncResult })
    }
  } catch (error) {
    if (error.response) {
      try {
        const errorData = await error.response.json();
        return NextResponse.json({ ...errorData }, { status: 200 });
      } catch (parseError) {
        console.log('Error parsing JSON from response:', parseError);
        return NextResponse.json({ message: 'Failed to parse error response' }, { status: 500 });
      }
    } else {
      return NextResponse.json({ error: error.message || 'Unknown error' }, { status: 400 });
    }
  }
}

const getStatus = async (apiKey: string, uuid: string) => {
  try {
    const response = await ky(`${process.env.NEXT_PUBLIC_API_URL}/doc2x_v2/api/v2/parse/status`, {
      timeout: false,
      method: 'get',
      headers: {
        "Authorization": `Bearer ${apiKey}`
      },
      searchParams: {
        uid: uuid,
        ocr: true
      }
    })
    const result = await response.json();
    return result;
  } catch (error) {
    if (error.response) {
      try {
        const errorData = await error.response.json();
        return { ...errorData }
      } catch (parseError) {
        return { error: 'Failed to parse error response' }
      }
    } else {
      return { error: error.message || 'Unknown error' }
    }
  }
}

const convertImgTagToMarkdown = (htmlString) => {
  // Match<img>tags using regular expressions
  const imgTagRegex = /<img\s+src="(.*?)"(.*?)\/>/g;

  // Replace the image syntax with Markdown format
  const markdownString = htmlString.replace(imgTagRegex, (match, p1) => {
    // P1 is the captured src value
    return `![Description of Image](${p1})`;
  });
  return markdownString;
}