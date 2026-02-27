"use client";

import { Button, NativeSelect, createTheme } from "@mantine/core";

export const theme = createTheme({
  components: {
    NativeSelect: NativeSelect.extend({
      classNames: {
        // Remove Tailwind's drop-down style
        input: "bg-none",
      },
    }),
  },
});
