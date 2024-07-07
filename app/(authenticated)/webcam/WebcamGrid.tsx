"use client";

import { WebcamView } from "@/components/WebcamView";
import { WebcamFeed } from "@prisma/client";
import { use } from "react";
import {
  addWebcamSchema,
  editWebcamSchema,
  removeWebcamSchema,
} from "./schema";
import { z } from "zod";
import { FormResponse } from "@/components/Form";
import { WebcamCreateForm, WebcamEditForm, WebcamRemoveForm } from "./form";
import { addWebcam } from "./actions";
import {
  ActionIcon,
  Card,
  Grid,
  Group,
  Stack,
  Text,
  Tooltip,
} from "@mantine/core";
import { useElementSize } from "@mantine/hooks";
import { PermissionGate } from "@/components/UserContext";
import { FaEdit } from "react-icons/fa";

export function WebcamGrid(props: {
  webcams: Promise<WebcamFeed[]>;
  addWebcam: (data: z.infer<typeof addWebcamSchema>) => Promise<FormResponse>;
  editWebcam: (data: z.infer<typeof editWebcamSchema>) => Promise<FormResponse>;
  removeWebcam: (
    data: z.infer<typeof removeWebcamSchema>,
  ) => Promise<FormResponse>;
}) {
  const webcamFeeds = use(props.webcams);

  return (
    <>
      <WebcamCreateForm create={addWebcam} />
      {webcamFeeds.length > 0 ? (
        <Grid>
          {webcamFeeds.map((feed) => (
            <WebcamGridCol
              feed={feed}
              key={feed.webcam_id}
              editWebcam={props.editWebcam}
              removeWebcam={props.removeWebcam}
            />
          ))}
        </Grid>
      ) : (
        <>No Webcams added yet, try adding one using the button above.</>
      )}
    </>
  );
}

function WebcamGridCol(props: {
  feed: WebcamFeed;
  editWebcam: (data: z.infer<typeof editWebcamSchema>) => Promise<FormResponse>;
  removeWebcam: (
    data: z.infer<typeof removeWebcamSchema>,
  ) => Promise<FormResponse>;
}) {
  const { ref, height, width } = useElementSize();

  return (
    <Grid.Col span={{ base: 12, sm: 6 }}>
      <Card withBorder w={"auto"}>
        <Stack>
          <Text size="xl" fw={700}>
            {props.feed.full_name}
          </Text>
          <Card.Section ref={ref}>
            <WebcamView webcamUrl={props.feed.hls_url} width={width} />
          </Card.Section>
          <Group>
            <PermissionGate required={"ManageWebcams"}>
              <WebcamEditForm webcam={props.feed} edit={props.editWebcam} />
              <WebcamRemoveForm
                webcam={props.feed}
                remove={props.removeWebcam}
              />
            </PermissionGate>
          </Group>
        </Stack>
      </Card>
    </Grid.Col>
  );
}
