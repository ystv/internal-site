import * as Sentry from "@sentry/nextjs";

import { FeedbackPrompt } from "@/components/FeedbackPrompt";
import { LoginPrompt } from "@/components/LoginPrompt";
import Nav from "@/components/Nav";
import { QueryProvider } from "@/components/QueryProvider";
import { UserProvider } from "@/components/UserContext";
import { WebsocketProvider } from "@/components/WebsocketProvider";
import { getCurrentUserOrNull } from "@/lib/auth/server";

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
