import { LoginPrompt } from "@/components/LoginPrompt";
import { UserProvider } from "@/components/contexts/UserContext";
import Nav from "@/components/navigation/Nav";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { WebsocketProvider } from "@/components/providers/WebsocketProvider";
import { FeedbackPrompt } from "@/components/util/FeedbackPrompt";
import { getCurrentUserOrNull } from "@/lib/auth/server";
import * as Sentry from "@sentry/nextjs";

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
              Calendar version {process.env.NEXT_PUBLIC_RELEASE}. Built and
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
