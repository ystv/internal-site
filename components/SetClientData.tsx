"use client";

import { useDocumentTitle } from "@mantine/hooks";

export function SetClientData(props: { title?: string }) {
  useDocumentTitle(`${props.title ? props.title + " | " : ""}YSTV Calendar`);

  return <></>;
}
