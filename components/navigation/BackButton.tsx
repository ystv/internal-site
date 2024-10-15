"use client";

import { Button } from "@mantine/core";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { FaChevronLeft } from "react-icons/fa";

export function BackButton(props: { path?: string }) {
  const router = useRouter();

  useEffect(() => {
    if (props.path) router.prefetch(props.path);
  });

  return (
    <Button
      onClick={() => {
        if (props.path) {
          router.push(props.path);
        } else {
          router.back();
        }
      }}
      leftSection={<FaChevronLeft />}
      variant="subtle"
    >
      Back
    </Button>
  );
}
