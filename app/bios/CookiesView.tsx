"use client";

import { Button, Card, Group, Stack, Text } from "@mantine/core";
import type { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { useRouter } from "next/navigation";
import { deleteCookie } from "./actions";

export function CookieView(props: { cookies: RequestCookie[] }) {
  const router = useRouter();

  return (
    <Stack m={20}>
      <Button onClick={() => router.push("/login")}>Back to login</Button>
      {props.cookies.map((cookie, idx) => {
        return (
          <Card key={idx}>
            <Group>
              <Stack>
                <Text>{cookie.name}</Text>
                <Text>{cookie.value}</Text>
              </Stack>
              <Button
                onClick={async () => {
                  await deleteCookie(cookie.name);
                  router.refresh();
                }}
                ml={"auto"}
              >
                Clear
              </Button>
            </Group>
          </Card>
        );
      })}
    </Stack>
  );
}
