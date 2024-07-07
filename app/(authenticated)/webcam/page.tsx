import { WebcamView } from "@/components/WebcamView";
import { fetchWebcamFeeds } from "@/features/webcams";
import { Center, Group, Loader, Stack } from "@mantine/core";
import { Suspense } from "react";
import { WebcamGrid } from "./WebcamGrid";
import { addWebcam, editWebcam, removeWebcam } from "./actions";

export default function WebcamPage() {
  const webcamFeeds = fetchWebcamFeeds();

  return (
    <Center>
      <Stack>
        <Suspense fallback={<Loader />}>
          <WebcamGrid
            webcams={webcamFeeds}
            addWebcam={addWebcam}
            editWebcam={editWebcam}
            removeWebcam={removeWebcam}
          />
        </Suspense>
      </Stack>
    </Center>
  );
}
