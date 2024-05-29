import { RoleWithPermissions } from "@/components/RolesContext";
import GoogleIcon from "@/components/icons/GoogleIcon";
import SlackIcon from "@/components/icons/SlackIcon";
import {
  Card,
  Group,
  Stack,
  ActionIcon,
  Avatar,
  Highlight,
  Text,
} from "@mantine/core";

export function RoleCard(props: {
  role: RoleWithPermissions;
  searchQuery: string | undefined;
}) {
  const highlightValue = props.searchQuery?.split(" ") || [];
  return (
    <>
      <Card withBorder key={props.role.role_id}>
        <Stack gap={"xs"}>
          <Highlight highlight={highlightValue}>{props.role.name}</Highlight>
          {props.role.permissions.map((permission) => {
            return (
              <Highlight
                highlight={highlightValue}
                c={"dimmed"}
                size="xs"
                key={permission.permission}
              >
                {permission.permission}
              </Highlight>
            );
          })}
        </Stack>
      </Card>
    </>
  );
}
