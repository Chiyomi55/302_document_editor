import "@/styles/globals.css";
import "@/styles/prosemirror.css";

import type { Viewport } from "next";
import type { ReactNode } from "react";
import Providers from "./providers";
import { Toaster } from "@/components/tailwind/ui/toaster";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";

export const viewport: Viewport = {
  themeColor: "#ffffff",
};

export default async function RootLayout({ children, params: { locale }, }: { children: ReactNode, params: { locale: string }; }) {
  const messages = await getMessages();
  return (
    <html lang={locale} suppressHydrationWarning>
      <NextIntlClientProvider messages={messages}>
        <body>
          <Toaster />
          <Providers>{children}</Providers>
        </body>
      </NextIntlClientProvider>
    </html>
  );
}
