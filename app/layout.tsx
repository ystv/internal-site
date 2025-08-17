import {
  ColorSchemeScript,
  mantineHtmlProps,
  MantineProvider,
} from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import { Notifications } from "@mantine/notifications";
import { Inter } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";

import { DEBUG_MODE_COOKIE } from "@/app/enableDebugMode/common";
import { DebugIndicator, DebugModeProvider } from "@/components/DebugMode";
import { PublicURLProvider } from "@/components/PublicURLContext";
import { env } from "@/lib/env";

import { theme } from "./theme";

import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "@mantine/notifications/styles.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "YSTV Internal Site",
  description: "YSTV Internal Site",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const debugMode = (await cookies()).get(DEBUG_MODE_COOKIE)?.value === "true";
  return (
    <html lang="en" {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript defaultColorScheme="auto" />
      </head>
      <body className={inter.className}>
        <MantineProvider theme={theme} defaultColorScheme="auto">
          <ModalsProvider>
            <PublicURLProvider value={env.PUBLIC_URL!}>
              <DebugModeProvider value={debugMode}>
                {children}
                <DebugIndicator />
              </DebugModeProvider>
            </PublicURLProvider>
            <Notifications />
          </ModalsProvider>
        </MantineProvider>
      </body>
    </html>
  );
}
