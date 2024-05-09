import Image from "next/image";
import Logo from "@/app/_assets/logo.png";
import Link from "next/link";
import { UserProvider } from "@/components/UserContext";
import { mustGetCurrentUser } from "@/lib/auth/server";
import YSTVBreadcrumbs from "@/components/Breadcrumbs";
import * as Sentry from "@sentry/nextjs";
import { UserMenu } from "@/components/UserMenu";

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
  return (
    <UserProvider user={user}>
      <nav className="mb-4 flex h-[4.5rem] flex-row flex-nowrap items-center bg-dark px-2 text-light shadow-black/5">
        <Link href="/" className="inline-block">
          <Image
            src={Logo}
            alt=""
            placeholder="blur"
            height={96}
            className="max-h-[4.5rem] w-auto py-2"
          />
        </Link>
        <div className="ml-auto h-14 w-14 space-x-1">
          <UserMenu userAvatar={user.avatar} />
        </div>
      </nav>
      <div className="mx-2 md:mx-6">
        <YSTVBreadcrumbs />
      </div>
      <br />
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
    </UserProvider>
  );
}
