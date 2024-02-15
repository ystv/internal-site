import "./globals.css";
import { Inter } from "next/font/google";
import { cookies } from "next/headers";
import { DebugIndicator, DebugModeProvider } from "@/components/DebugMode";
import { DEBUG_MODE_COOKIE } from "@/app/enableDebugMode/common";
import { PublicURLProvider } from "@/components/PublicURLContext";
import { ColorSchemeScript, MantineProvider } from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import { theme } from "./theme";

import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "@mantine/notifications/styles.css";
import { Notifications } from "@mantine/notifications";

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
        <MantineProvider theme={theme} defaultColorScheme="auto">
          <ModalsProvider>
            <PublicURLProvider value={process.env.PUBLIC_URL!}>
              <DebugModeProvider value={debugMode}>
                {children}
                <DebugIndicator />
                <footer className="mt-8 text-center text-sm text-gray-500">
                  Calendar version {process.env.NEXT_PUBLIC_RELEASE}.
                </footer>
              </DebugModeProvider>
            </PublicURLProvider>
            <Notifications />
          </ModalsProvider>
        </MantineProvider>
      </body>
    </html>
  );
}
