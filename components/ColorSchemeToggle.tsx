"use client";

import { LuMoon, LuSun } from "react-icons/lu";
import { Button, Menu } from "@mantine/core";
import { useMantineColorScheme } from "@mantine/core";

export function ModeToggle() {
  const { setColorScheme } = useMantineColorScheme();

  return (
    <Menu>
      <Menu.Target>
        <Button variant="outline" size="icon">
          <LuSun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <LuMoon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Item onClick={() => setColorScheme("light")}>Light</Menu.Item>
        <Menu.Item onClick={() => setColorScheme("dark")}>Dark</Menu.Item>
        <Menu.Item onClick={() => setColorScheme("auto")}>System</Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
