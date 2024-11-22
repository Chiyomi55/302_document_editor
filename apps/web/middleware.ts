
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import createIntlMiddleware from 'next-intl/middleware';

// Create next intl middleware
const intlMiddleware = createIntlMiddleware({
  locales: ['en', 'zh', 'ja'],
  defaultLocale: 'en'
});

// Custom Language Processing Middleware
async function languageMiddleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const langParam = request.nextUrl.searchParams.get("lang");
  const headerLang = request.headers.get("x-locale");
  let locale = langParam ? langParam.split('-')[0] : headerLang;

  if (!["zh", "en", "ja"].includes(locale || "")) {
    locale = "en";
  }

  const currentLocale = url.pathname.split('/')[1];
  if (["zh", "en", "ja"].includes(currentLocale)) {
    locale = currentLocale;
  } else {
    url.pathname = `/${locale}${url.pathname}`;
    url.searchParams.delete("lang");
    return NextResponse.redirect(url);
  }

  const response = NextResponse.next();
  response.headers.set("x-locale", locale || "en");
  return response;
}

// Composite middleware
export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Exclude paths that do not require processing
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Execute language processing middleware first
  const languageResult = await languageMiddleware(request);
  if (languageResult.status !== 200) {
    return languageResult;
  }

  // Execute next intl middleware
  return intlMiddleware(request);
}

// Merge Matcher Configuration
export const config = {
  matcher: [
    // Match all pathnames except for
    // - … if they start with `/api`, `/_next` or `/_vercel`
    // - … if they contain a dot (e.g. `favicon.ico`)
    '/((?!api|_next|_vercel|.*\\..*).*)',
    // Match all pathnames within `/dashboard`
    '/dashboard/:path*'
  ]
};