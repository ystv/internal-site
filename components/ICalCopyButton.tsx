"use client";
import { Button, CopyButton } from "@mantine/core";

export function ICalCopyButton({ link }: { link: string }) {
  return (
    <CopyButton value={link}>
      {({ copied, copy }) => (
        <Button color={copied ? "teal" : "blue"} onClick={copy}>
          {copied ? "Copied!" : "Copy url"}
        </Button>
      )}
    </CopyButton>
  );
}
