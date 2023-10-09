"use client"

import Image from "next/image";
import { Box, Center, Menu, SegmentedControl, useMantineColorScheme } from "@mantine/core";
import { UserType } from "@/lib/auth/server";
import { ModeToggle } from "./ColorSchemeToggle";
import Link from "next/link";
import { LuLaptop, LuMoon, LuSun } from "react-icons/lu";

export function UserMenu({userAvatar}: {userAvatar: string}) {
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
        />
      </Menu.Target>
      <Menu.Dropdown className="min-w-[150px] mr-2 -ml-1.5 right-2">
        <Menu.Item component="a" href="/user/me">
          Profile
        </Menu.Item>
        <Menu.Divider />
        <Menu.Label>
          Theme
        </Menu.Label>
          <SegmentedControl
            value={colorScheme}
            onChange={setColorScheme}
            className="min-w-full"
            data={[
              {
                value: 'light',
                label: (
                  <Center>
                    <LuSun className="scale-150"/>
                  </Center>
                )
              },
              {
                value: 'auto',
                label: (
                  <Center>
                    <LuLaptop className="scale-150"/>
                  </Center>
                  
                )
              }
              ,{
                value: 'dark',
                label: (
                  <Center>
                    <LuMoon className="scale-150"/>
                  </Center>
                )
              },
            ]}
          />
      </Menu.Dropdown>
    </Menu>
  )
  
}