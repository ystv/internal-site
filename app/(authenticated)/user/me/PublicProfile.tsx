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
  TextInput,
} from "@mantine/core";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { FaQuestion, FaTrash } from "react-icons/fa";

import { setPronounsSchema } from "@/features/people/schema";
import { isMinioEnabledAction } from "@/lib/minio/actions";

import {
  getPublicProfileAction,
  setPronounsAction,
  setPublicAvatarAction,
} from "./actions";
import { AvatarUpload } from "./AvatarUpload";

export function PublicProfile() {
  const [modalOpened, setModalOpened] = useState(
    null as null | "avatar:edit" | "avatar:view" | "pronouns:edit",
  );

  const isMinioEnabled = useQuery({
    queryKey: ["features:minio"],
    queryFn: async () => {
      return await isMinioEnabledAction();
    },
  });

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

  const [pronouns, setPronouns] = useState<string | null>(
    publicProfileQuery.data?.pronouns ?? null,
  );

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
          <Text>Pronouns</Text>
          <Text ml={"auto"}>
            {publicProfileQuery.data?.pronouns ?? "Not specified"}
          </Text>
          <Button onClick={() => setModalOpened("pronouns:edit")}>Edit</Button>
          <Tooltip label="Delete Pronouns">
            <ActionIcon
              onClick={async () => {
                const res = await setPronounsAction({ pronouns: null });
                if (res.ok) {
                  notifications.show({
                    message: "Deleted Pronouns",
                    color: "green",
                  });
                  publicProfileQuery.refetch();
                }
                return res;
              }}
              size={"lg"}
              color="red"
            >
              <FaTrash />
            </ActionIcon>
          </Tooltip>
        </Group>
        {isMinioEnabled.data && (
          <Group>
            <Text>Avatar</Text>
            <Button ml={"auto"} onClick={() => setModalOpened("avatar:edit")}>
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
                  onClick={() => setModalOpened("avatar:view")}
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
        )}
      </Stack>
      <AvatarUpload
        opened={modalOpened === "avatar:edit"}
        onClose={() => {
          setModalOpened(null);
          publicProfileQuery.refetch();
        }}
      />
      <Modal
        opened={modalOpened === "avatar:view"}
        onClose={() => setModalOpened(null)}
      >
        <Center>
          <Avatar
            src={publicProfileQuery.data?.public_avatar}
            style={{ width: "100%", maxWidth: 512, height: "auto" }}
          />
        </Center>
      </Modal>
      <Modal
        title="Edit Pronouns"
        opened={modalOpened === "pronouns:edit"}
        onClose={() => setModalOpened(null)}
      >
        <Stack>
          <TextInput
            label="Pronouns"
            placeholder="Enter your pronouns"
            value={pronouns ?? ""}
            onChange={(event) => setPronouns(event.currentTarget.value)}
            error={
              pronouns &&
              !setPronounsSchema.shape.pronouns.safeParse(pronouns).success
                ? "Pronouns must be lowercase words separated by slashes"
                : null
            }
          />
          <Button
            onClick={async () => {
              const res = await setPronounsAction({
                pronouns: pronouns ?? null,
              });
              if (res.ok) {
                notifications.show({
                  message: "Updated Pronouns",
                  color: "green",
                });
                setModalOpened(null);
                publicProfileQuery.refetch();
              }
              return res;
            }}
          >
            Submit
          </Button>
        </Stack>
      </Modal>
    </>
  );
}
