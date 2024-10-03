"use client";

import { useEffect, useRef } from "react";
import MuxVideo from "@mux/mux-video-react";
import { Box, LoadingOverlay } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";

export function WebcamView(props: {
  webcamUrl: string;
  width?: string | number;
  parentHeight?: number;
}) {
  const ref = useRef<HTMLVideoElement>(null);

  const [videoReady, { open: setReady, close: setUnready }] =
    useDisclosure(false);

  useEffect(() => {
    // The four (4) here is the value of readyState when a video element is ready to play
    // See: https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/readyState
    if (ref.current?.readyState === 4) {
      setReady();
    } else {
      setUnready();
    }
  }, [ref.current?.readyState, setReady, setUnready]);

  return (
    <>
      <Box pos={"relative"}>
        <LoadingOverlay
          visible={!videoReady}
          w={props.width}
          h={props.parentHeight}
        />
      </Box>
      <MuxVideo
        src={props.webcamUrl}
        autoPlay
        playsInline
        muted
        width={props.width || 400}
        ref={ref}
      />
    </>
  );
}