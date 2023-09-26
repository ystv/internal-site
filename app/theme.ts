"use client";

import { Button, createTheme } from "@mantine/core";

export const theme = createTheme({
  components: {
    Button: Button.extend({
      classNames: {
        root: `danger:bg-red-600 warning:bg-orange-600`,
      }
    })
  }
});
