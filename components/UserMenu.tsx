"use client";

import Image from "next/image";
import {
  Box,
  Center,
  Menu,
  SegmentedControl,
  useMantineColorScheme,
  VisuallyHidden,
} from "@mantine/core";
import { LuLaptop, LuMoon, LuSun } from "react-icons/lu";
import { PermissionGate } from "@/components/UserContext";

export function UserMenu({ userAvatar }: { userAvatar: string }) {
  const { setColorScheme, colorScheme } = useMantineColorScheme();

  return (
    <Menu closeOnItemClick={false}>
      <Menu.Target>
        <Image
          src={userAvatar}
          alt=""
          width={56}
          height={56}
          className="duration-50 max-w-14 max-h-14 cursor-pointer rounded-[28px] border-0 border-solid transition-all hover:rounded-xl hover:border-2 hover:border-slate-200"
          aria-label="user menu"
        />
      </Menu.Target>
      <Menu.Dropdown className="right-2 -ml-1.5 mr-2 mt-1.5 min-w-[150px]">
        <Menu.Item component="a" href="/user/me">
          Profile
        </Menu.Item>
        <Menu.Divider />
        <PermissionGate required={"SuperUser"}>
          <Menu.Item component="a" href="/admin">
            Admin pages
          </Menu.Item>
          <Menu.Divider />
        </PermissionGate>
        <Menu.Label>Theme</Menu.Label>
        <SegmentedControl
          value={colorScheme}
          onChange={setColorScheme}
          className="min-w-full"
          data={[
            {
              value: "light",
              label: (
                <Center>
                  <LuSun className="scale-150" aria-label="light mode" />
                  <VisuallyHidden>Light Mode</VisuallyHidden>
                </Center>
              ),
            },
            {
              value: "auto",
              label: (
                <Center>
                  <LuLaptop className="scale-150" aria-label="auto mode" />
                  <VisuallyHidden>Auto Mode</VisuallyHidden>
                </Center>
              ),
            },
            {
              value: "dark",
              label: (
                <Center>
                  <LuMoon className="scale-150" aria-label="dark mode" />
                  <VisuallyHidden>Dark Mode</VisuallyHidden>
                </Center>
              ),
            },
          ]}
        />
      </Menu.Dropdown>
    </Menu>
  );
}
