"use client";

import { WebcamView } from "@/app/(authenticated)/webcam/WebcamView";
import { PermissionGate } from "@/components/contexts/UserContext";
import { Card, Grid, Group, Stack, Text } from "@mantine/core";
import { useElementSize } from "@mantine/hooks";
import type { WebcamFeed } from "@prisma/client";
import { use } from "react";
import { addWebcam, editWebcam, removeWebcam } from "./actions";
import { WebcamCreateForm, WebcamEditForm, WebcamRemoveForm } from "./form";

export function WebcamGrid(props: { webcams: Promise<WebcamFeed[]> }) {
  const webcamFeeds = use(props.webcams);

  return (
    <>
      <PermissionGate required={"Webcams.Manage"}>
        <WebcamCreateForm create={addWebcam} />
      </PermissionGate>
      {webcamFeeds.length > 0 ? (
        <Grid w={"100%"}>
          {webcamFeeds.map((feed) => (
            <WebcamGridCol feed={feed} key={feed.webcam_id} />
          ))}
        </Grid>
      ) : (
        <>No Webcams added yet.</>
      )}
    </>
  );
}

function WebcamGridCol(props: { feed: WebcamFeed }) {
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
              <WebcamEditForm webcam={props.feed} edit={editWebcam} />
              <WebcamRemoveForm webcam={props.feed} remove={removeWebcam} />
            </PermissionGate>
          </Group>
        </Stack>
      </Card>
    </Grid.Col>
  );
}
