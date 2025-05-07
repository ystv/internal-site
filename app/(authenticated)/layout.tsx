import Image from "next/image";
import Logo from "@/app/_assets/logo-new.png";
import Link from "next/link";
import { UserProvider } from "@/components/UserContext";
import { getCurrentUserOrNull } from "@/lib/auth/server";
import YSTVBreadcrumbs from "@/components/Breadcrumbs";
import * as Sentry from "@sentry/nextjs";
import { UserMenu } from "@/components/UserMenu";
import { QueryProvider } from "@/components/QueryProvider";
import { LoginPrompt } from "@/components/LoginPrompt";
import { WebsocketProvider } from "@/components/WebsocketProvider";
import { useCreateSocket } from "@/lib/socket";
import { FeedbackPrompt } from "@/components/FeedbackPrompt";
import Nav from "@/components/Nav";

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUserOrNull();

  if (typeof user == "string") {
    return <LoginPrompt />;
  }

  Sentry.setUser({
    id: user.user_id,
    email: user.email,
  });

  return (
    <WebsocketProvider>
      <UserProvider user={user}>
        <QueryProvider>
          <Nav user={user}>
            <main className="mx-2 max-w-[min(theme(maxWidth.6xl),theme(maxWidth.full))] overflow-x-hidden md:mx-6 [@media(min-width:calc(theme(maxWidth.6xl)+theme(margin.6)*2))]:mx-auto">
              {children}
            </main>
            <br />
            <footer className="mt-8 text-center text-sm text-gray-500">
              Internal Site version {process.env.NEXT_PUBLIC_RELEASE}. Built and
              maintained by the YSTV Computing Team. <FeedbackPrompt />
            </footer>
            <style
              dangerouslySetInnerHTML={{
                __html: `
            body {
              transition: background-color 0.5s;
            }
          `,
              }}
            />
          </Nav>
        </QueryProvider>
      </UserProvider>
    </WebsocketProvider>
  );
}
