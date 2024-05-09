"use client";

import { Button, HoverCard } from "@mantine/core";
import { AiFillDelete } from "react-icons/ai";

export default function SlackLogoutButton() {
  return (
    <HoverCard>
      <HoverCard.Target>
        <Button variant="filled" color="red" className="ml-auto" type="submit">
          <AiFillDelete />
        </Button>
      </HoverCard.Target>
      <HoverCard.Dropdown fz={14}>
        Remove linked Slack account.
      </HoverCard.Dropdown>
    </HoverCard>
  );
}
