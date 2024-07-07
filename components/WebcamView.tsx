"use client";

import ReactHlsPlayer from "react-hls-player";
import HLSPlayer from "./HlsPlayer";
import { useRef } from "react";

export function WebcamView(props: {
  webcamUrl: string;
  width?: string | number;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  return (
    <>
      <HLSPlayer
        manifest={props.webcamUrl}
        autoPlay
        playsInline
        muted
        width={props.width || 400}
      />
      {/* <ReactHlsPlayer
        src={props.webcamUrl}
        playerRef={ref}
        muted
        autoPlay
        playsInline
        width={props.width || 400}
      /> */}
    </>
  );
}
