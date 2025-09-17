"use client";

import {
  Avatar,
  Button,
  Center,
  Group,
  InputLabel,
  Loader,
  Modal,
  Slider,
  Stack,
  Stepper,
  Text,
} from "@mantine/core";
import {
  Dropzone,
  type FileWithPath,
  IMAGE_MIME_TYPE,
} from "@mantine/dropzone";
import { notifications } from "@mantine/notifications";
import { useRef, useState } from "react";
import AvatarEditor from "react-avatar-editor";
import {
  FaCheck,
  FaChevronLeft,
  FaChevronRight,
  FaUpload,
} from "react-icons/fa";
import { IoMdPhotos } from "react-icons/io";
import { LuX } from "react-icons/lu";

import { setPublicAvatarAction } from "./actions";

export function AvatarUpload(props: { opened: boolean; onClose: () => void }) {
  const [activeStep, setActiveStep] = useState(0);

  const [selectedFile, setSelectedFile] = useState<FileWithPath | null>(null);
  const [scale, setScale] = useState(1);

  const [finalImage, setFinalImage] = useState<string | null>(null);

  const setActiveStepWithCheck = (step: number) => {
    if (activeStep == 0 && step == 1 && selectedFile === null) {
      notifications.show({
        message: "Please select a file before proceeding",
        color: "red",
      });
    }
  };

  const editorRef = useRef<AvatarEditor>(null);

  if (editorRef.current) {
    editorRef.current.getImage();
  }

  const onClose = () => {
    props.onClose();
    setActiveStep(0);
    setSelectedFile(null);
    setScale(1);
    setFinalImage(null);
  };

  return (
    <Modal
      onClose={() => {
        onClose();
      }}
      opened={props.opened}
      title="Edit Public Avatar"
      size={"xl"}
    >
      <Stepper
        active={activeStep}
        onStepClick={setActiveStepWithCheck}
        allowNextStepsSelect={false}
      >
        <Stepper.Step label="File Select">
          <Dropzone
            maxFiles={1}
            onDrop={(files) => {
              setSelectedFile(files[0]);
              setActiveStep(1);
            }}
            accept={IMAGE_MIME_TYPE}
          >
            <Group
              justify="center"
              gap="xl"
              mih={220}
              style={{ pointerEvents: "none" }}
            >
              <Dropzone.Accept>
                <FaUpload size={52} color="var(--mantine-color-blue-6)" />
              </Dropzone.Accept>
              <Dropzone.Reject>
                <LuX size={52} color="var(--mantine-color-red-6)" />
              </Dropzone.Reject>
              <Dropzone.Idle>
                <IoMdPhotos size={52} color="var(--mantine-color-dimmed)" />
              </Dropzone.Idle>

              <div>
                <Text size="xl" inline>
                  Drag images here or click to select files
                </Text>
                <Text size="sm" c="dimmed" inline mt={7}>
                  Attach as many files as you like, each file should not exceed
                  5mb
                </Text>
              </div>
            </Group>
          </Dropzone>
        </Stepper.Step>
        <Stepper.Step label="Edit Image">
          <Stack>
            <Button
              leftSection={<FaChevronLeft />}
              onClick={() => {
                setSelectedFile(null);
                setActiveStep(0);
              }}
            >
              Back to file select
            </Button>
            <Center>
              {selectedFile ? (
                <AvatarEditor
                  image={selectedFile}
                  scale={scale}
                  style={{ width: "100%", maxWidth: 512, height: "auto" }}
                  width={512}
                  height={512}
                  ref={editorRef}
                  disableHiDPIScaling
                />
              ) : (
                <Loader />
              )}
            </Center>
            <InputLabel>Zoom</InputLabel>
            <Slider
              defaultValue={scale}
              min={1}
              max={5}
              step={0.05}
              onChange={setScale}
            />
            <Button
              rightSection={<FaChevronRight />}
              onClick={() => {
                if (editorRef.current) {
                  const image = editorRef.current
                    .getImageScaledToCanvas()
                    .toDataURL();

                  setFinalImage(image);

                  setActiveStep(2);
                }
              }}
            >
              Next Step
            </Button>
          </Stack>
        </Stepper.Step>
        <Stepper.Step label="Review Image">
          <Center>
            <Avatar
              src={finalImage}
              style={{ width: "100%", maxWidth: 512, height: "auto" }}
            />
          </Center>
          <Group>
            <Button
              ml={"auto"}
              leftSection={<FaCheck />}
              color="green"
              onClick={async () => {
                const res = await setPublicAvatarAction({
                  avatar_data_url: finalImage!,
                });

                if (res.ok) {
                  onClose();

                  notifications.show({
                    message: "Updated Public Avatar",
                    color: "green",
                  });
                }
              }}
            >
              Confirm
            </Button>
          </Group>
        </Stepper.Step>
      </Stepper>
    </Modal>
  );
}
