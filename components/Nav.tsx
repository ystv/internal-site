"use client";
import { AppShell, Group, rem } from "@mantine/core";
import { useHeadroom } from "@mantine/hooks";
import Image from "next/image";
import Link from "next/link";
import Logo from "@/app/_assets/logo-new.png";
import { UserMenu } from "@/components/UserMenu";
import styles from "@/styles/Nav.module.css";
import YSTVBreadcrumbs from "@/components/Breadcrumbs";

interface NavProps {
  children: React.ReactNode;
  user: any;
}

export default function Nav({ children, user }: NavProps) {
  const pinned = useHeadroom({ fixedAt: 100 });
  return (
    <AppShell
      header={{ height: 80, collapsed: !pinned, offset: false }}
      padding="md"
      classNames={{ header: styles.header }}
    >
      <AppShell.Header bg-dark="true">
        <Group h="100%" px="md">
          <Link href="/">
            <Image
              src={Logo}
              alt=""
              placeholder="blur"
              height={96}
              className="max-h-[4.5rem] w-auto py-2"
            />
          </Link>
          <YSTVBreadcrumbs />
          <div className="ml-auto h-14 w-14 space-x-1">
            <UserMenu userAvatar={user.avatar} />
          </div>
        </Group>
      </AppShell.Header>

      <AppShell.Main pt={`calc(${rem(80)} + var(--mantine-spacing-md))`}>
        {children}
      </AppShell.Main>
    </AppShell>
  );
}
