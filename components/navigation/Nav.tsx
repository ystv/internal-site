"use client";
import {
  ActionIcon,
  AppShell,
  Burger,
  Group,
  NavLink,
  rem,
  Stack,
  Title,
} from "@mantine/core";
import { useDisclosure, useHeadroom } from "@mantine/hooks";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { BsChatLeftQuoteFill } from "react-icons/bs";
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

  const [opened, { toggle }] = useDisclosure();

  return (
    <AppShell
      header={{ height: 80, collapsed: !pinned }}
      padding="md"
      classNames={{ header: styles.header }}
      navbar={{
        width: 300,
        breakpoint: "sm",
        collapsed: { mobile: !opened, desktop: !opened },
      }}
    >
      <AppShell.Header bg-dark="true">
        <Group h="100%" px="md">
          <Burger opened={opened} onClick={toggle} size="sm" color="white" />
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
        <Navbar />
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

function Navbar() {
  const links: NavbarLinks[] = [
    {
      permissions: "ManageQuotes",
      href: "/quotes",
      label: " Quotes Board",
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
      <PermissionGate required={"ManageQuotes"}>
        <NavLink
          component={Link}
          href={"/quotes"}
          label={"Quotes Board"}
          leftSection={
            <BsChatLeftQuoteFill
              style={{ position: "relative", top: 2 }}
              size={20}
            />
          }
        />
      </PermissionGate>
      <PermissionGate
        required={["Admin.Positions", "Admin.Roles", "Admin.Users"]}
      >
        <NavLink
          component={Link}
          href={"/admin"}
          label={"Admin Pages"}
          leftSection={<MdAdminPanelSettings size={24} />}
        />
      </PermissionGate>
    </PermissionGate>
  );
}
