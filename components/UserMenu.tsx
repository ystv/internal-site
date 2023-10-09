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

export function UserMenu({ userAvatar }: { userAvatar: string }) {
  const { setColorScheme, colorScheme } = useMantineColorScheme();

  return (
    <Menu closeOnItemClick={false}>
      <Menu.Target>
        <Image
          src={userAvatar}
          alt=""
          width={96}
          height={96}
          className="max-h-[4.5rem] w-auto rounded-full py-2"
          aria-label="user menu"
        />
      </Menu.Target>
      <Menu.Dropdown className="right-2 -ml-1.5 mr-2 min-w-[150px]">
        <Menu.Item component="a" href="/user/me">
          Profile
        </Menu.Item>
        <Menu.Divider />
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
