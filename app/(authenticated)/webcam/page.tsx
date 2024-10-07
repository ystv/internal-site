import { WebcamView } from "@/components/WebcamView";
import { fetchWebcamFeeds } from "@/features/webcams";
import { Center, Group, Loader, Stack } from "@mantine/core";
import { Suspense } from "react";
import { WebcamGrid } from "./WebcamGrid";
import { addWebcam, editWebcam, removeWebcam } from "./actions";
import { SetClientData } from "@/components/SetClientData";

export const dynamic = "force-dynamic";

export default function WebcamPage() {
  const webcamFeeds = fetchWebcamFeeds();

  return (
    <>
      <SetClientData title="Webcams" />
      <Center>
        <Stack w={"100%"}>
          <Suspense fallback={<Loader />}>
            <WebcamGrid webcams={webcamFeeds} />
          </Suspense>
        </Stack>
      </Center>
    </>
  );
}
