import React, { useState, useEffect } from "react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export default function Video({
  selectedTag,
  searchQuery,
}) {
  const [videosItems, setVideosItems] =
    useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {

        const res =
          await axios.get(
            `${API_BASE}/api/media`
          );

        setVideosItems(
          (res.data || []).filter(
            (item) =>
              item.type?.toLowerCase() ===
              "video"
          )
        );

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

  /* Tag filter */

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

  /* Search filter */

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

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">

        {filteredItems.map(
          (item) => {

            const aspectClass =
  item.orientation === "vertical"
    ? "aspect-[9/16]"
    : item.orientation === "square"
    ? "aspect-square"
    : "aspect-video";

            const videoUrl =
              item.url.startsWith(
                "http"
              )
                ? item.url
                : `${API_BASE}${item.url}`;

            const isExternalVideo =
              videoUrl.includes(
                "youtube.com"
              ) ||
              videoUrl.includes(
                "youtu.be"
              ) ||
              videoUrl.includes(
                "vimeo.com"
              );

            return (
              <div
                key={
                  item._id ||
                  item.url
                }
                className="rounded-xl overflow-hidden shadow bg-zinc-900"
              >

                {isExternalVideo ? (

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
    allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    allowFullScreen
  />

</div>

                ) : (

                  <video
                    controls
                    preload="metadata"
                    autoPlay={false}
                    playsInline
                    className="w-full rounded-xl"
                  >

                    <source
                      src={
                        videoUrl
                      }
                      type="video/mp4"
                    />

                    Your browser
                    does not
                    support
                    video.

                  </video>

                )}

              </div>
            );
          }
        )}

      </div>

    </div>
  );
}
