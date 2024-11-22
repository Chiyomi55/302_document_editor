"use client";

import store from "../store";
import { Toaster } from "sonner";
import { Provider } from "react-redux";
import { Analytics } from "@vercel/analytics/react";
import { ThemeProvider, useTheme } from "next-themes";
import useLocalStorage from "@/hooks/use-local-storage";
import { type Dispatch, type ReactNode, type SetStateAction, createContext, useEffect } from "react";
import ScriptLoader from "./ScriptLoader";

export const AppContext = createContext<{
  font: string;
  setFont: Dispatch<SetStateAction<string>>;
}>({
  font: "Default",
  setFont: () => { },
});

const ToasterProvider = () => {
  const { theme } = useTheme() as {
    theme: "light" | "dark" | "system";
  };
  return <Toaster theme={theme} />;
};

export default function Providers({ children }: { children: ReactNode }) {
  const [font, setFont] = useLocalStorage<string>("novel__font", "Default");

  return (
    <ThemeProvider attribute="class" enableSystem disableTransitionOnChange defaultTheme="light">
      <AppContext.Provider value={{ font, setFont, }}  >
        <ToasterProvider />
        <Provider store={store}>
          {children}
          <ScriptLoader />
        </Provider>
        <Analytics />
      </AppContext.Provider>
    </ThemeProvider>
  );
}
