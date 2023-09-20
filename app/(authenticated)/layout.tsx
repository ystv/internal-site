import Image from "next/image";
import Logo from "@/app/_assets/logo.png";
import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import { UserProvider } from "@/components/UserContext";
import { mustGetCurrentUser } from "@/lib/auth/server";

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await mustGetCurrentUser();
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
        <div className="ml-auto space-x-1">
          <Image src={user.avatar} alt="" width={96} height={96} className="max-h-[4.5rem] w-auto py-2 rounded-full" />
        </div>
      </nav>
      <Breadcrumbs />
      <main className="mx-2 max-w-3xl lg:mx-auto">
      {children}
      </main>
    </UserProvider>
  );
}
