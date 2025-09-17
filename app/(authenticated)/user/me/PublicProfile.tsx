"use client";

import {
  Group,
  Title,
  Tooltip,
  ActionIcon,
  Text,
  Stack,
  Button,
  Avatar,
  Modal,
  Center,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { useQuery } from "@tanstack/react-query";
import { FaQuestion, FaTrash } from "react-icons/fa";

import { getPublicProfileAction, setPublicAvatarAction } from "./actions";
import { AvatarUpload } from "./AvatarUpload";

export function PublicProfile() {
  const [
    avatarEditModalOpened,
    { open: openAvatarEditModal, close: closeAvatarEditModal },
  ] = useDisclosure(false);

  const [
    avatarViewModalOpened,
    { open: openAvatarViewModal, close: closeAvatarViewModal },
  ] = useDisclosure(false);

  const publicProfileQuery = useQuery({
    queryKey: ["user:publicProfile"],
    queryFn: async () => {
      const res = await getPublicProfileAction({});
      if (!res.ok) {
        throw new Error("An error occurred updating committee positions.");
      } else {
        return res.data;
      }
    },
  });

  return (
    <>
      <Stack>
        <Group>
          <Title order={3}>Public Profile</Title>
          <Tooltip label={<Text>More info</Text>}>
            <ActionIcon
              variant="subtle"
              color="gray"
              ml={"auto"}
              onClick={() => {
                modals.open({
                  title: "Public Profile Info",
                  children: (
                    <Stack>
                      <Text>
                        This section relates to your profile when displayed
                        publicly. This is currently only the case if you have a
                        committee position, and can be viewed on the welcome
                        site.
                      </Text>
                      <Text>
                        If you have any concerns about where this information is
                        available please contact computing.
                      </Text>
                    </Stack>
                  ),
                });
              }}
            >
              <FaQuestion />
            </ActionIcon>
          </Tooltip>
        </Group>
        <Group>
          <Text>Avatar</Text>
          <Button ml={"auto"} onClick={openAvatarEditModal}>
            Edit
          </Button>
          {publicProfileQuery.data?.public_avatar && (
            <>
              <Button
                leftSection={
                  <Avatar
                    src={publicProfileQuery.data?.public_avatar}
                    size={30}
                  />
                }
                onClick={openAvatarViewModal}
              >
                View
              </Button>
              <Button
                leftSection={<FaTrash />}
                onClick={async () => {
                  const res = await setPublicAvatarAction({
                    avatar_data_url: null,
                  });

                  if (res.ok) {
                    notifications.show({
                      message: "Deleted Public Avatar",
                      color: "green",
                    });

                    publicProfileQuery.refetch();
                  }
                }}
                color="red"
              >
                Delete
              </Button>
            </>
          )}
        </Group>
      </Stack>
      <AvatarUpload
        opened={avatarEditModalOpened}
        onClose={() => {
          closeAvatarEditModal();
          publicProfileQuery.refetch();
        }}
      />
      <Modal opened={avatarViewModalOpened} onClose={closeAvatarViewModal}>
        <Center>
          <Avatar
            src={publicProfileQuery.data?.public_avatar}
            style={{ width: "100%", maxWidth: 512, height: "auto" }}
          />
        </Center>
      </Modal>
    </>
  );
}
