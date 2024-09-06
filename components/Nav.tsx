"use client";
import { Anchor, AppShell, Burger, Group, rem, Text } from "@mantine/core";
import { useDisclosure, useHeadroom } from "@mantine/hooks";
import Image from "next/image";
import Link from "next/link";
import Logo from "@/app/_assets/logo.png";
import { UserMenu } from "@/components/UserMenu";
import styles from "@/styles/Nav.module.css";
import YSTVBreadcrumbs from "@/components/Breadcrumbs";
import { FeedbackPrompt } from "./FeedbackPrompt";

interface NavProps {
  children: React.ReactNode;
  user: any;
}

export default function Nav({ children, user }: NavProps) {
  const headerPinned = {
    /*useHeadroom({ fixedAt: 100 });}*/
  };
  const footerPinned = useHeadroom({ fixedAt: 100 });
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);

  return (
    <>
      <AppShell
        header={{ height: 80, collapsed: !headerPinned, offset: true }}
        /*footer={{ height: 80, collapsed: !footerPinned, offset: false }}*/
        navbar={{
          width: 300,
          breakpoint: "sm",
          collapsed: {
            mobile: !mobileOpened,
            desktop: !desktopOpened,
          },
        }}
        padding="md"
        classNames={{ header: styles.header }}
      >
        <AppShell.Header bg-dark="true" className={styles.header}>
          <Group h="100%" px="md">
            <Burger
              opened={mobileOpened}
              onClick={toggleMobile}
              hiddenFrom="sm"
              size="sm"
              color="white"
            />
            <Burger
              opened={desktopOpened}
              onClick={toggleDesktop}
              visibleFrom="sm"
              size="sm"
              color="white"
            />
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
        <AppShell.Navbar p="md" className={styles.navbar}>
          Navbar
        </AppShell.Navbar>
        <AppShell.Main
          pt={`calc(${rem(80)} + var(--mantine-spacing-md))`}
          h={`10vh - ${rem(80)} - var(--mantine-spacing-md)`}
        >
          {children}
        </AppShell.Main>
        {/*<AppShell.Footer bg-dark="true">
        <div className="flex h-full items-center justify-center">
          <Text ta="center">
            Calendar version {process.env.NEXT_PUBLIC_RELEASE}. Built and
            maintained by the YSTV Computing Team. <FeedbackPrompt />
          </Text>
        </div>
      </AppShell.Footer>*/}
      </AppShell>
    </>
  );
}
