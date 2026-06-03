import React, { useRef, useState } from "react";

export default function CustomVideoPlayer({
  src,
  className = "",
}) {
  console.log("CUSTOM PLAYER LOADED", src);
  const videoRef = useRef(null);

  const [isPlaying, setIsPlaying] =
    useState(false);

  const [showControls, setShowControls] =
    useState(true);

  let hideTimer = null;

  const togglePlay = () => {
    const video =
      videoRef.current;

    if (!video) return;

    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }

    setShowControls(true);

    clearTimeout(hideTimer);

    hideTimer = setTimeout(() => {
      setShowControls(false);
    }, 2000);
  };

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      onClick={togglePlay}
    >
      <video
        ref={videoRef}
        src={src}
        playsInline
        preload="metadata"
        className="w-full"
      />

      {showControls && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20">

          <button
            className="w-20 h-20 rounded-full bg-black/60 text-white text-3xl flex items-center justify-center"
          >
            {isPlaying
              ? "❚❚"
              : "▶"}
          </button>

        </div>
      )}
    </div>
  );
}
