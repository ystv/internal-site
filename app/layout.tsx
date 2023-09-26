import "./globals.css";
import { Inter } from "next/font/google";
import { cookies } from "next/headers";
import { DebugIndicator, DebugModeProvider } from "@/components/DebugMode";
import { DEBUG_MODE_COOKIE } from "@/app/enableDebugMode/common";
import { PublicURLProvider } from "@/components/PublicURLContext";
import { ColorSchemeScript, MantineProvider } from '@mantine/core';
import { ModalsProvider } from "@mantine/modals";
import { theme } from "./theme";

import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "YSTV Calendar",
  description: "YSTV Calendar",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const debugMode = cookies().get(DEBUG_MODE_COOKIE)?.value === "true";
  return (
    <html lang="en">
      <head>
        <ColorSchemeScript />
      </head>
      <body className={inter.className}>
        <MantineProvider theme={theme}>
          <ModalsProvider>
            <PublicURLProvider value={process.env.PUBLIC_URL!}>
              <DebugModeProvider value={debugMode}>
                {children}
                <DebugIndicator />
              </DebugModeProvider>
            </PublicURLProvider>
          </ModalsProvider>
        </MantineProvider>
      </body>
    </html>
  );
}
