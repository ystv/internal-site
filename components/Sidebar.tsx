import { useEffect, useState } from "react";
import {
  NavLink,
  Paper,
  Text,
  SegmentedControl,
  Center,
  VisuallyHidden,
} from "@mantine/core";
import {
  LuCalendar,
  LuCog,
  LuNewspaper,
  LuUser,
  LuLaptop,
  LuMoon,
  LuSun,
} from "react-icons/lu";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import styles from "@/styles/Nav.module.css";
import { getUserName } from "@/components/UserHelpers";
import { useCurrentUser } from "@/components/UserContext"; // Import useCurrentUser
import { PermissionGate } from "@/components/UserContext";
import { useMantineColorScheme } from "@mantine/core";

// Define a type for permissions
type Permission =
  | "SuperUser"
  | "PUBLIC"
  | "MEMBER"
  | "Watch.Admin"
  | "Calendar.Admin"
  | "Calendar.Show.Admin"
  | "Calendar.Show.Creator"
  | "Calendar.Meeting.Admin"
  | "Calendar.Meeting.Creator"
  | "ManageQuotes";

export default function Sidebar() {
  const user = useCurrentUser(); // Get user from context
  const userName = getUserName(user);
  const pathname = usePathname();
  const router = useRouter();
  const { setColorScheme, colorScheme } = useMantineColorScheme();

  const navLinks: {
    href: string;
    label: string;
    icon: JSX.Element;
    permission?: Permission;
  }[] = [
    { href: "/calendar", label: "Calendar", icon: <LuCalendar /> },
    {
      href: "/admin",
      label: "Admin",
      icon: <LuCog />,
      permission: "SuperUser",
    },
    { href: "/news", label: "News", icon: <LuNewspaper /> },
    { href: "/feedback", label: "Feedback", icon: <LuNewspaper /> },
    { href: "/user/me", label: "Profile", icon: <LuUser /> },
  ];

  const colors = [
    "red",
    "orange",
    "yellow",
    "green",
    "blue",
    "indigo",
    "violet",
  ]; // Colors for the nav links

  const userPermissions = user.permissions || []; // Example user permissions, replace with actual logic

  const filteredNavLinks = navLinks.filter(
    (link) => !link.permission || userPermissions.includes(link.permission),
  );

  return (
    <div
      className={`${styles.sidebar} grid h-full grid-rows-[87%_13%] md:grid-rows-[90%_10%]`}
    >
      <div className={styles.sidebarLinks}>
        {filteredNavLinks.map((link, index) => (
          <NavLink
            key={link.href}
            href={link.href}
            label={link.label}
            leftSection={link.icon}
            variant={
              pathname.includes(link.href.split("/")[1]) ? "filled" : "light"
            }
            className="rounded-lg"
            mt="md"
            active
            color={colors[index]}
          >
            {link.href === "/admin" && (
              <PermissionGate required="SuperUser">
                <NavLink
                  href="/admin/positions"
                  label="Positions"
                  leftSection={<LuCog />}
                  variant={
                    pathname.includes("admin/positions") ? "filled" : "light"
                  }
                  className="rounded-lg"
                  mt="md"
                  active
                  color="orange"
                />
                <NavLink
                  href="/admin/roles"
                  label="Roles"
                  leftSection={<LuCog />}
                  variant={
                    pathname.includes("admin/roles") ? "filled" : "light"
                  }
                  className="rounded-lg"
                  mt="md"
                  active
                  color="orange"
                />
                <NavLink
                  href="/admin/users"
                  label="Users"
                  leftSection={<LuCog />}
                  variant={
                    pathname.includes("admin/users") ? "filled" : "light"
                  }
                  className="rounded-lg"
                  mt="md"
                  active
                  color="orange"
                />
              </PermissionGate>
            )}
          </NavLink>
        ))}
      </div>
      <Paper
        className={`${styles.sidebarFooter} cursor-pointer`}
        radius={0}
        onClick={() => router.push("/user/me")}
      >
        <div className="ml-4 flex h-full items-center justify-start gap-6">
          <Image
            src={user.avatar}
            alt=""
            width={56}
            height={56}
            className={styles.sidebarFooterImage}
            aria-label="user menu"
          />
          <Text c="white" className={styles.sidebarFooterText}>
            {userName}
          </Text>
        </div>
      </Paper>
    </div>
  );
}
