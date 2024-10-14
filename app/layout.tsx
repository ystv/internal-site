import { DEBUG_MODE_COOKIE } from "@/app/enableDebugMode/common";
import { PublicURLProvider } from "@/components/contexts/PublicURLContext";
import { DebugIndicator, DebugModeProvider } from "@/components/util/DebugMode";
import { env } from "@/lib/env";
import { ColorSchemeScript, MantineProvider } from "@mantine/core";
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import { ModalsProvider } from "@mantine/modals";
import { Notifications } from "@mantine/notifications";
import "@mantine/notifications/styles.css";
import { Inter } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";
import { theme } from "./theme";

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
