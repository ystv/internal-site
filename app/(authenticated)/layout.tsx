import Image from "next/image";
import Logo from "@/app/_assets/logo.png";
import Link from "next/link";
import { UserProvider } from "@/components/UserContext";
import { mustGetCurrentUser } from "@/lib/auth/server";
import YSTVBreadcrumbs from "@/components/Breadcrumbs";
import * as Sentry from "@sentry/nextjs";
import { UserMenu } from "@/components/UserMenu";
import { WebsocketProvider } from "@/components/WebsocketProvider";
import { useCreateSocket } from "@/lib/socket";
import Nav from "@/components/Nav";

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await mustGetCurrentUser();
  Sentry.setUser({
    id: user.user_id,
    username: user.username,
    email: user.email,
  });

  // const { socket, isConnected, transport } = createSocket();

  return (
    <WebsocketProvider>
      <UserProvider user={user}>
        <Nav user={user}>
          <main className="mx-2 max-w-[min(theme(maxWidth.6xl),theme(maxWidth.full))] overflow-x-hidden md:mx-6 [@media(min-width:calc(theme(maxWidth.6xl)+theme(margin.6)*2))]:mx-auto">
            {children}
          </main>
          <br />
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
      </UserProvider>
    </WebsocketProvider>
  );
}
