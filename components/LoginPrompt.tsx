"use client";

import { Button, Card, Center, Stack, Text } from "@mantine/core";
import { usePathname, useRouter } from "next/navigation";

export function LoginPrompt() {
  const router = useRouter();
  const pathname = usePathname();

  function doLoginRedirect() {
    router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
  }

  setTimeout(doLoginRedirect, 3000);

  return (
    <>
      <Center my={200}>
        <Card>
          <Center>
            <Stack>
              <Text size="xl" fw={700}>
                You aren't logged in.
              </Text>
              <Text size="md">Redirecting to login in 3 seconds...</Text>
              <Button onClick={doLoginRedirect}>Redirect Now</Button>
            </Stack>
          </Center>
        </Card>
      </Center>
    </>
  );
}
