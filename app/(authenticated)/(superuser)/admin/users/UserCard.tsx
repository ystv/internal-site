import { UserWithIdentities } from "@/components/UsersContext";
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
  Tooltip,
} from "@mantine/core";
import Link from "next/link";
import { FaEye } from "react-icons/fa";

export function UserCard(props: {
  user: UserWithIdentities;
  searchQuery: string | undefined;
}) {
  return (
    <>
      <Card withBorder key={props.user.user_id}>
        <Stack>
          <Group>
            <Link href={`/admin/users/${props.user.user_id}`}>
              <Avatar src={props.user.avatar} />
            </Link>
            <Stack gap={0}>
              <Highlight highlight={props.searchQuery?.split(" ") || []}>
                {`${props.user.first_name} ${
                  props.user.nickname && '"' + props.user.nickname + '" '
                }${props.user.last_name}`}
              </Highlight>
              <Highlight
                highlight={props.searchQuery?.split(" ") || []}
                c={"dimmed"}
                size="sm"
              >
                {props.user.email}
              </Highlight>
            </Stack>
            <Group ml={"auto"}>
              {props.user.identities.map((identity) => {
                switch (identity.provider) {
                  case "google":
                    return (
                      <ActionIcon key={identity.identity_id} variant="default">
                        <GoogleIcon />
                      </ActionIcon>
                    );

                  case "slack":
                    return (
                      <ActionIcon key={identity.identity_id} variant="default">
                        <SlackIcon />
                      </ActionIcon>
                    );

                  default:
                    break;
                }

                return <></>;
              })}
              <Link href={`/admin/users/${props.user.user_id}`}>
                <Tooltip label="View / Edit User">
                  <ActionIcon variant="light">
                    <FaEye />
                  </ActionIcon>
                </Tooltip>
              </Link>
            </Group>
          </Group>
          {props.user.roles.length > 0 && (
            <Stack gap={0}>
              {props.user.roles.map((role) => {
                return (
                  <Text c="dimmed" size="sm" key={role.role_id}>
                    {role.name}
                  </Text>
                );
              })}
            </Stack>
          )}
        </Stack>
      </Card>
    </>
  );
}
