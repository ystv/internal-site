"use client";
import {
  Anchor,
  AppShell,
  Box,
  Burger,
  Group,
  NavLink,
  rem,
  Text,
} from "@mantine/core";
import { useDisclosure, useHeadroom } from "@mantine/hooks";
import Image from "next/image";
import Link from "next/link";
import Logo from "@/app/_assets/logo.png";
import { UserMenu } from "@/components/UserMenu";
import styles from "@/styles/Nav.module.css";
import YSTVBreadcrumbs from "@/components/Breadcrumbs";
import { FeedbackPrompt } from "./FeedbackPrompt";
import { LuCalendar, LuCog, LuNewspaper, LuUser } from "react-icons/lu";
import { usePathname } from "next/navigation";
import path from "path";
import Sidebar from "@/components/Sidebar";

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
  const pathname = usePathname();

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
        <AppShell.Header
          bg-dark="true"
          className={`${styles.header} flex w-full items-center justify-between sm:justify-start`}
        >
          <Group
            h="100%"
            px="md"
            className="flex w-full items-center justify-between"
          >
            {/* Left side with burger menus */}
            <div className="flex items-center">
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
            </div>

            {/* Centered logo with negative margin */}
            <div className="flex grow justify-center md:justify-start">
              <Link href="/">
                <Image
                  src={Logo}
                  alt="Logo"
                  placeholder="blur"
                  height={96}
                  className="mr-10 max-h-[4.5rem] w-auto cursor-pointer py-2 md:mr-0"
                />
              </Link>
            </div>

            {/* Optional Breadcrumbs, visible on larger screens */}
            <Box visibleFrom="sm">
              <YSTVBreadcrumbs />
            </Box>
          </Group>
        </AppShell.Header>

        <AppShell.Navbar className={styles.navbar}>
          <Sidebar />
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
