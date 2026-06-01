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

  const getEmbedUrl = (url) => {
    if (!url) return "";

    /* Google Drive */

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

    /* YouTube Short URL */

    if (
      url.includes("youtu.be/")
    ) {
      const id =
        url
          .split("youtu.be/")[1]
          ?.split("?")[0];

      return `https://www.youtube.com/embed/${id}`;
    }

    /* YouTube Watch URL */

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

            const videoUrl = rawUrl;

            const aspectClass =
              item.orientation ===
              "vertical"
                ? "aspect-[9/16]"
                : item.orientation ===
                  "square"
                ? "aspect-square"
                : "aspect-video";

            const isIframeVideo =
  item.url.includes("youtube") ||
  item.url.includes("drive.google");

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

                  <video
                    src={videoUrl}
                    controls
                    preload="metadata"
                    playsInline
                    className="w-full"
                  />

                )}

              </div>
            );
          }
        )}

      </div>

    </div>
  );
}
