import Image from "next/image";
import Link from "next/link";
import { UserProvider } from "@/components/UserContext";
import { getCurrentUser, mustGetCurrentUser } from "@/lib/auth/server";
import YSTVBreadcrumbs from "@/components/Breadcrumbs";
import * as Sentry from "@sentry/nextjs";
import { UserMenu } from "@/components/UserMenu";
import { QueryProvider } from "@/components/QueryProvider";
import { LoginPrompt } from "@/components/LoginPrompt";
import { WebsocketProvider } from "@/components/WebsocketProvider";
import { useCreateSocket } from "@/lib/socket";
import { FeedbackPrompt } from "@/components/FeedbackPrompt";
import Nav from "@/components/Nav";
import { NotLoggedIn } from "@/lib/auth/errors";
import { redirect } from "next/navigation";

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let user;
  try {
    user = await getCurrentUser();
  } catch (e) {
    if (e instanceof NotLoggedIn) {
      redirect("/login");
    }
    throw e;
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
