import { PageInfo } from "@/components/helpers/PageInfo";
import { fetchWebcamFeeds } from "@/features/webcams";
import { Center, Loader, Stack } from "@mantine/core";
import { Suspense } from "react";
import { WebcamGrid } from "./WebcamGrid";

export const dynamic = "force-dynamic";

export default function WebcamPage() {
  const webcamFeeds = fetchWebcamFeeds();

  return (
    <>
      <PageInfo title="Webcams" />
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
