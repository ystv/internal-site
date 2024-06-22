import { WebcamView } from "@/components/WebcamView";
import { Center, Group, Stack } from "@mantine/core";

export default function WebcamPage() {
  return (
    <Center>
      <Stack>
        {/* <Group>
          <WebcamView webcam="control1" />
          <WebcamView webcam="studio1" />
        </Group>
        <Group>
          <WebcamView webcam="studio2" />
          <WebcamView webcam="tech1" />
        </Group> */}
        <Group>
          <WebcamView webcam="driveway_camera" />
          <WebcamView webcam="garden_camera" />
        </Group>
      </Stack>
    </Center>
  );
}
