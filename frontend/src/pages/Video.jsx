import React, { useState, useEffect } from "react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export default function Video({
  selectedTag,
  searchQuery,
}) {
  const [videosItems, setVideosItems] =
    useState([]);

  const [playingVideo, setPlayingVideo] =
    useState(null);

  const [showControls, setShowControls] =
    useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(
          `${API_BASE}/api/media`
        );

        const videos =
          (res.data || []).filter(
            (item) =>
              item.type
                ?.toLowerCase()
                .trim() === "video"
          );

        setVideosItems(videos);
      } catch (err) {
        console.error(
          "Failed to fetch videos:",
          err
        );
      }
    };

    fetchData();
  }, []);

  let filteredItems =
    videosItems;

  // Tag Filter
  if (
    selectedTag &&
    selectedTag !== "All"
  ) {
    filteredItems =
      filteredItems.filter(
        (item) =>
          item.tags?.some(
            (tag) =>
              tag.toLowerCase() ===
              selectedTag.toLowerCase()
          )
      );
  }

  // Search Filter
  if (
    searchQuery &&
    searchQuery.trim() !== ""
  ) {
    filteredItems =
      filteredItems.filter(
        (item) =>
          item.tags?.some(
            (tag) =>
              tag
                .toLowerCase()
                .includes(
                  searchQuery.toLowerCase()
                )
          )
      );
  }

  const getEmbedUrl = (url) => {
    if (!url) return "";

    // Google Drive
    if (
      url.includes(
        "drive.google.com/file/d/"
      )
    ) {
      const match =
        url.match(
          /\/file\/d\/([^/]+)/
        );

      if (match) {
        return `https://drive.google.com/file/d/${match[1]}/preview`;
      }
    }

    // youtu.be
    if (
      url.includes("youtu.be/")
    ) {
      const id =
        url
          .split("youtu.be/")[1]
          ?.split("?")[0];

      return `https://www.youtube.com/embed/${id}`;
    }

    // youtube watch
    if (
      url.includes(
        "youtube.com/watch?v="
      )
    ) {
      const id =
        new URL(url)
          .searchParams.get("v");

      return `https://www.youtube.com/embed/${id}`;
    }

    return url;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">

        {filteredItems.map(
          (item) => {

            const rawUrl =
              item.url?.startsWith(
                "http"
              )
                ? item.url
                : `${API_BASE}${item.url}`;

            const videoUrl =
              getEmbedUrl(rawUrl);

            const aspectClass =
              item.orientation ===
              "vertical"
                ? "aspect-[9/16]"
                : item.orientation ===
                  "square"
                ? "aspect-square"
                : "aspect-video";

            const isIframeVideo =
              videoUrl.includes(
                "youtube.com/embed"
              ) ||
              videoUrl.includes(
                "drive.google.com"
              );

            return (
              <div
                key={
                  item._id ||
                  item.url
                }
                className="rounded-xl overflow-hidden shadow bg-zinc-900"
              >

                {isIframeVideo ? (

                  <div
                    className={`relative w-full ${aspectClass}`}
                  >
                    <iframe
                      src={videoUrl}
                      title={
                        item.title ||
                        "Video"
                      }
                      className="absolute inset-0 w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>

                ) : (

                  <div className="relative">

                    <video
                      src={videoUrl}
                      playsInline
                      preload="metadata"
                      className="w-full cursor-pointer"
                      ref={(el) => {
                        if (el)
                          window[
                            `video_${item._id}`
                          ] = el;
                      }}
                      onClick={() => {

                        const video =
                          window[
                            `video_${item._id}`
                          ];

                        if (!video)
                          return;

                        if (
                          video.paused
                        ) {
                          video.play();
                          setPlayingVideo(
                            item._id
                          );
                        } else {
                          video.pause();
                          setPlayingVideo(
                            null
                          );
                        }

                        setShowControls(
                          item._id
                        );

                        setTimeout(
                          () => {
                            setShowControls(
                              null
                            );
                          },
                          2000
                        );
                      }}
                    />

                    {showControls ===
                      item._id && (

                      <button
                        className="absolute inset-0 flex items-center justify-center text-white text-5xl bg-black/20"
                        onClick={(
                          e
                        ) => {
                          e.stopPropagation();

                          const video =
                            window[
                              `video_${item._id}`
                            ];

                          if (
                            !video
                          )
                            return;

                          if (
                            video.paused
                          ) {
                            video.play();
                            setPlayingVideo(
                              item._id
                            );
                          } else {
                            video.pause();
                            setPlayingVideo(
                              null
                            );
                          }
                        }}
                      >
                        {playingVideo ===
                        item._id
                          ? "⏸"
                          : "▶"}
                      </button>

                    )}

                  </div>

                )}

              </div>
            );
          }
        )}

      </div>

    </div>
  );
}
