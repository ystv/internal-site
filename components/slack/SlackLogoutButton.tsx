"use client";

import { Button, HoverCard } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { AiFillDelete } from "react-icons/ai";

export default function SlackLogoutButton(props: {
  action: () => Promise<boolean> | void;
}) {
  return (
    <HoverCard>
      <HoverCard.Target>
        <Button
          variant="filled"
          color="red"
          className="ml-auto"
          type="submit"
          onClick={async () => {
            const deleteResult = await props.action();

            if (deleteResult == false) {
              notifications.show({
                title: "Cannot remove slack link",
                message:
                  "You cannot disconnect your slack account as you use it to sign in",
                color: "red",
                autoClose: 5000,
              });
            }
          }}
        >
          <AiFillDelete />
        </Button>
      </HoverCard.Target>
      <HoverCard.Dropdown fz={14}>
        Remove linked Slack account.
      </HoverCard.Dropdown>
    </HoverCard>
  );
}
