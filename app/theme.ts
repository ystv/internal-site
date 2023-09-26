"use client";

import { Button, NativeSelect, createTheme } from "@mantine/core";

export const theme = createTheme({
  components: {
    Button: Button.extend({
      classNames: {
        root: `danger:bg-danger warning:bg-warning`,
      },
    }),
    NativeSelect: NativeSelect.extend({
      classNames: {
        // Remove Tailwind's drop-down style
        input: "bg-none",
      },
    }),
  },
});
