"use client";
import { Button, CopyButton } from "@mantine/core";

export function ICalCopyButton({ link }: { link: string }) {
  return (
    <CopyButton value={link}>
      {({ copied, copy }) => (
        <Button
          color={copied ? "teal" : "blue"}
          onClick={copy}
          className="ml-auto sm:ml-0"
        >
          {copied ? "Copied!" : "Copy url"}
        </Button>
      )}
    </CopyButton>
  );
}
