"use client";

import Script from "next/script";
import HLSPlayer from "./HlsPlayer";

export function WebcamView(props: { webcam: string }) {
  // const webcamURL = `https://webcam.ystv.co.uk/${props.webcam}/s.m3u8`;
  const webcamURL = `https://webcam.moir.xyz/api/stream.m3u8?src=${props.webcam}`;

  const video = document.getElementById(props.webcam);

  const videoSrcHls = webcamURL;

  return (
    <>
      <HLSPlayer manifest={webcamURL} autoPlay playsInline muted width={400} />
      {/* <video id={props.webcam} autoPlay playsInline muted></video>
    <script type="text/javascript">
      if (Hls.isSupported()) {
          const hls = new Hls();
          hls.loadSource(videoSrcHls);
          hls.attachMedia(video);
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = videoSrcHls;
      }
      document.getElementById(props.webcam).play();
    </script> */}
    </>
  );
}
