"use client";

import {
  HoverCard,
  HoverCardDropdown,
  HoverCardTarget,
  Modal,
  Text,
  ThemeIcon,
  UnstyledButton,
} from "@mantine/core";
import { useState } from "react";
import Form, { FormAction } from "./Form";
import { zfd } from "zod-form-data";
import { z } from "zod";
import { TextField } from "./FormFields";
import { LuEdit } from "react-icons/lu";
import * as People from "@/features/people";

export function NicknameEdit(props: {
  nickname: string | undefined;
  action: FormAction<{ newNickname: string | null }>;
  user: People.ExposedUser;
}) {
  const [modalOpened, toggleModal] = useState(false);
  const [nickname, setNickname] = useState<string | null>(
    props.nickname ?? null,
  );

  return (
    <h2 className="my-0">
      {props.user.first_name}{" "}
      {nickname && (
        <UnstyledButton
          onClick={() => {
            toggleModal(true);
          }}
        >
          <h2 className="my-0">&quot;{nickname}&quot;</h2>
          {!nickname && (
            <HoverCard>
              <HoverCardTarget>
                <ThemeIcon variant="default">
                  <LuEdit />
                </ThemeIcon>
              </HoverCardTarget>
              <HoverCardDropdown>
                <Text>Edit your nickname</Text>
              </HoverCardDropdown>
            </HoverCard>
          )}
        </UnstyledButton>
      )}{" "}
      {props.user.last_name}{" "}
      <UnstyledButton
        onClick={() => {
          toggleModal(true);
        }}
      >
        <HoverCard>
          <HoverCardTarget>
            <ThemeIcon variant="default">
              <LuEdit />
            </ThemeIcon>
          </HoverCardTarget>
          <HoverCardDropdown>
            <Text size="sm">Edit your nickname</Text>
          </HoverCardDropdown>
        </HoverCard>
      </UnstyledButton>
      <Modal opened={modalOpened} onClose={() => toggleModal(false)}>
        <Form
          action={(data) => {
            toggleModal(false);
            return props.action(data);
          }}
          onSuccess={(res: { ok: boolean; newNickname: string | null }) => {
            setNickname(res.newNickname);
          }}
          schema={zfd.formData({ nickname: z.string().nullable() })}
          initialValues={{ nickname: nickname }}
          submitLabel="Update"
        >
          <TextField name="nickname" label="New Nickname" required />
        </Form>
      </Modal>
    </h2>
  );
}
