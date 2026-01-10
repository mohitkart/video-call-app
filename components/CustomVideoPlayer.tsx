/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef } from "react";

export interface CustomVideoPlayerProps {
  src: string | MediaStream;
  playing?: boolean;
  muted?: boolean;
  className?: string;
  height?: string;
  width?: string;
  selectedAudioOutput?: string;
}

const CustomVideoPlayer: React.FC<CustomVideoPlayerProps> = ({
  src,
  playing = true,
  muted = false,
  className = "",
  height='100%',
  width='100%',
  selectedAudioOutput = "default",
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  /** Handle MediaStream OR URL */
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (src instanceof MediaStream) {
      // ✅ Correct way for WebRTC / PeerJS streams
      video.srcObject = src;
    } else {
      // ✅ Normal video URL
      video.srcObject = null;
      video.src = src;
    }
  }, [src]);

  /** Play / Pause control */
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (playing) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [playing]);

  /** Audio output device */
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (
      selectedAudioOutput &&
      selectedAudioOutput !== "default" &&
      typeof (video as any).setSinkId === "function"
    ) {
      (video as any)
        .setSinkId(selectedAudioOutput)
        .catch((err: any) =>
          console.warn("Failed to set audio output device:", err)
        );
    }
  }, [selectedAudioOutput]);

  return (
    <video
      ref={videoRef}
      muted={muted}
      autoPlay
      playsInline
      className={className}
      style={{ width: width, height:height, objectFit: "cover" }}
    />
  );
};

export default CustomVideoPlayer;
