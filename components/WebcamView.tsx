"use client";

import { Box, LoadingOverlay } from "@mantine/core";
import MuxVideo from "@mux/mux-video-react";
import { useEffect, useRef, useState } from "react";

export function WebcamView(props: {
  webcamUrl: string;
  width?: string | number;
  parentHeight?: number;
}) {
  const ref = useRef<HTMLVideoElement>(null);

  const [videoReady, setVideoReady] = useState(false);

  useEffect(() => {
    // Copy the element ref so that we can still reference it in the
    // cleanup callback.
    const el = ref.current;
    if (!el) {
      return;
    }
    function isReady() {
      setVideoReady(true);
    }
    function isNotReady() {
      setVideoReady(false);
    }
    el.addEventListener("canplay", isReady);
    for (const evt of ["stalled", "waiting", "error"]) {
      el.addEventListener(evt, isNotReady);
    }
    return () => {
      el.removeEventListener("canplay", isReady);
      for (const evt of ["stalled", "waiting", "error"]) {
        el.removeEventListener(evt, isNotReady);
      }
    };
    // Since the key of the video element is also webcamUrl, this effect
    // will clean up and re-run whenever the webcamUrl changes.
  }, [props.webcamUrl]);

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
        key={props.webcamUrl}
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
