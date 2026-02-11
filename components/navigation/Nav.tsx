"use client";
import { AppShell, Burger, Group, NavLink, rem, Title } from "@mantine/core";
import { useDisclosure, useHeadroom } from "@mantine/hooks";
import Image from "next/image";
import Link from "next/link";
import { BsChatLeftQuoteFill } from "react-icons/bs";
import { FaQrcode } from "react-icons/fa";
import { MdAdminPanelSettings } from "react-icons/md";

import Logo from "@/app/_assets/logo-new.png";
import YSTVBreadcrumbs from "@/components/Breadcrumbs";
import { UserMenu } from "@/components/UserMenu";
import { type Permission } from "@/lib/auth/permissions";
import styles from "@/styles/Nav.module.css";

import { PermissionGate } from "../UserContext";

interface NavProps {
  children: React.ReactNode;
  user: any;
}

export default function Nav({ children, user }: NavProps) {
  const pinned = useHeadroom({ fixedAt: 100 });

  const [mobileOpened, { toggle: toggleMobile, close: closeMobile }] =
    useDisclosure();
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure();

  return (
    <AppShell
      header={{ height: 80, collapsed: !pinned }}
      padding="md"
      classNames={{ header: styles.header }}
      navbar={{
        width: 300,
        breakpoint: "sm",
        collapsed: { mobile: !mobileOpened, desktop: !desktopOpened },
      }}
    >
      <AppShell.Header bg-dark="true">
        <Group h="100%" px="md">
          <Burger
            opened={desktopOpened}
            onClick={toggleDesktop}
            size="sm"
            color="white"
            visibleFrom="sm"
          />
          <Burger
            opened={mobileOpened}
            onClick={toggleMobile}
            size="sm"
            color="white"
            hiddenFrom="sm"
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

      <AppShell.Navbar p={10} zIndex={100}>
        <Navbar closeMobile={closeMobile} />
      </AppShell.Navbar>

      <AppShell.Main pt={`calc(${rem(80)} + var(--mantine-spacing-md))`}>
        {children}
      </AppShell.Main>
    </AppShell>
  );
}

interface NavbarLinks {
  permissions?: Permission | Permission[];
  href: string;
  label: string;
  leftSection: React.ReactNode;
}

function Navbar(props: { closeMobile: () => void }) {
  const links: NavbarLinks[] = [
    {
      href: "/qr",
      label: "QR Code Generator",
      leftSection: <FaQrcode />,
    },
    {
      permissions: "ManageQuotes",
      href: "/quotes",
      label: "Quotes Board",
      leftSection: (
        <BsChatLeftQuoteFill
          style={{ position: "relative", top: 2 }}
          size={20}
        />
      ),
    },
    {
      permissions: ["Admin.Positions", "Admin.Roles", "Admin.Users"],
      href: "/admin",
      label: "Admin Pages",
      leftSection: <MdAdminPanelSettings size={24} />,
    },
  ];

  const allPermissions = links
    .map((link) =>
      Array.isArray(link.permissions)
        ? link.permissions
        : link.permissions
        ? [link.permissions]
        : [],
    )
    .flat();

  return (
    <PermissionGate
      required={allPermissions}
      fallback={
        <Title order={4}>Nothing for you here I&apos;m afraid...</Title>
      }
    >
      {links.map((link) => {
        const navLink = (
          <NavLink
            component={Link}
            href={link.href}
            label={link.label}
            leftSection={link.leftSection}
            onClick={props.closeMobile}
          />
        );
        return link.permissions ? (
          <PermissionGate key={link.href} required={link.permissions}>
            {navLink}
          </PermissionGate>
        ) : (
          navLink
        );
      })}
    </PermissionGate>
  );
}
