"use client";
import { Anchor, AppShell, Group, rem, Text } from "@mantine/core";
import { useHeadroom } from "@mantine/hooks";
import Image from "next/image";
import Link from "next/link";
import Logo from "@/app/_assets/logo.png";
import { UserMenu } from "@/components/UserMenu";
import styles from "@/styles/Nav.module.css";
import YSTVBreadcrumbs from "@/components/Breadcrumbs";

interface NavProps {
  children: React.ReactNode;
  user: any;
}

export default function Nav({ children, user }: NavProps) {
  const headerPinned = useHeadroom({ fixedAt: 100 });
  const footerPinned = useHeadroom({ fixedAt: 100 });

  return (
    <AppShell
      header={{ height: 80, collapsed: !headerPinned, offset: false }}
      footer={{ height: 60, collapsed: !headerPinned, offset: false }}
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

      <AppShell.Main
        pt={`calc(${rem(80)} + var(--mantine-spacing-md))`}
        h={`10vh - ${rem(80)} - var(--mantine-spacing-md)`}
      >
        {children}
      </AppShell.Main>
      <AppShell.Footer bg-dark="true">
        <div className="flex h-full items-center justify-center">
          <Text ta="center">
            Calendar version {process.env.NEXT_PUBLIC_RELEASE}. Built and
            maintained by the{" "}
            <Anchor
              href="https://ystv.slack.com/archives/C05UATQKUMA"
              className="underline"
            >
              YSTV Computing Team
            </Anchor>
            .
          </Text>
        </div>
      </AppShell.Footer>
    </AppShell>
  );
}
