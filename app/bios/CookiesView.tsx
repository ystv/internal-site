"use client";

import { Stack, Card, Group, Button, Text } from "@mantine/core";
import { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { deleteCookie } from "./actions";
import { useRouter } from "next/navigation";

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
