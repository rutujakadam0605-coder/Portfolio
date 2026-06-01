import React, { useState, useEffect } from "react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export default function Video({
  selectedTag,
  searchQuery,
}) {
   console.log("VIDEO COMPONENT LOADED");
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

  if (
     &&
     !== "All"
  ) {
    filteredItems =
      filteredItems.filter(
        (item) =>
          item.tags?.some(
            (tag) =>
              tag.toLowerCase() ===
              .toLowerCase()
          )
      );
  }

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
    if (!url) return url;

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

    /* youtu.be */

    if (
      url.includes("youtu.be/")
    ) {
      const id =
        url.split("youtu.be/")[1]
          ?.split("?")[0];

      return `https://www.youtube.com/embed/${id}`;
    }

    /* youtube watch */

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

            console.log("MEDIA ITEM", item);
console.log("URL", item.url);

            const rawUrl =
              item.url.startsWith(
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

            const isExternal =
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

                {isExternal ? (

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
                    preload="auto"
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
