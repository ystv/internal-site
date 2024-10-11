"use client";

import { useEffect, useRef, useState } from "react";
import MuxVideo from "@mux/mux-video-react";
import { Box, LoadingOverlay } from "@mantine/core";

export function WebcamView(props: {
  webcamUrl: string;
  width?: string | number;
  parentHeight?: number;
}) {
  const ref = useRef<HTMLVideoElement>(null);

  const [videoReady, setVideoReady] = useState(false);

  useEffect(() => {
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
