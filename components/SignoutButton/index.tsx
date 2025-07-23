"use client";

import { Button } from "@mantine/core";

import { signOut } from "./actions";

export function SignoutButton() {
  return (
    <>
      <Button
        variant="filled"
        color="red"
        className="ml-auto"
        onClick={async () => {
          await signOut();
        }}
      >
        Sign Out
      </Button>
    </>
  );
}
