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
import { Card, Grid, Group, Stack, Text } from "@mantine/core";
import { useElementSize } from "@mantine/hooks";
import { PermissionGate } from "@/components/UserContext";

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
      <PermissionGate required={"Webcams.Manage"}>
        <WebcamCreateForm create={addWebcam} />
      </PermissionGate>
      {webcamFeeds.length > 0 ? (
        <Grid w={"100%"}>
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
        <>No Webcams added yet.</>
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
      <Card withBorder w={"100%"}>
        <Stack>
          <Text size="xl" fw={700}>
            {props.feed.full_name}
          </Text>
          <Card.Section ref={ref} className="w-100%">
            <WebcamView
              webcamUrl={props.feed.stream_url}
              width={width}
              parentHeight={height}
            />
          </Card.Section>
          <Group>
            <PermissionGate required={"Webcams.Manage"}>
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
