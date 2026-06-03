import React, { useState, useEffect } from "react";
import axios from "axios";
import Masonry from "react-masonry-css";

const breakpointColumnsObj = {
  default: 4,
  1100: 3,
  700: 2,
  500: 1,
};

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const Home = ({ selectedTag, searchQuery }) => {
  const [homeItems, setHomeItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(
          `${API_BASE}/api/media`
        );

        setHomeItems(res.data || []);
      } catch (err) {
        console.error(
          "Failed to fetch media:",
          err
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredItems = homeItems.filter(
    (item) => {

      if (
        selectedTag &&
        selectedTag !== "All"
      ) {

        const typeMatch =
  item.type?.toLowerCase() ===
    selectedTag.toLowerCase() ||
  item.tags?.some(
    (tag) =>
      tag.toLowerCase() ===
      selectedTag.toLowerCase()
  );

        if (!typeMatch) {
          return false;
        }
      }

      if (
        searchQuery &&
        searchQuery.trim() !== ""
      ) {

        const queryMatch =
          item.tags?.some((tag) =>
            tag
              .toLowerCase()
              .includes(
                searchQuery.toLowerCase()
              )
          );

        if (!queryMatch) {
          return false;
        }
      }

      return true;
    }
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-14 h-14 border-4 border-gray-300 border-t-black rounded-full animate-spin mx-auto"></div>

          <p className="mt-4 text-gray-600 text-lg font-medium">
            Loading Portfolio...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">

      <Masonry
        breakpointCols={breakpointColumnsObj}
        className="my-masonry-grid"
        columnClassName="my-masonry-grid_column"
      >

        {filteredItems.map((item) => {

          const mediaUrl =
            item.url?.startsWith("http")
              ? item.url
              : `${API_BASE}${item.url}`;

          const aspectClass =
            item.orientation === "vertical"
              ? "aspect-[9/16]"
              : item.orientation === "square"
              ? "aspect-square"
              : "aspect-";

          const isYoutube =
            mediaUrl.includes(
              "youtube.com/embed"
            ) ||
            mediaUrl.includes(
              "youtu.be"
            );

          const isDrive =
            mediaUrl.includes(
              "drive.google.com"
            );

          return (

            <div
              key={
                item._id ||
                item.url
              }
              className="overflow-hidden rounded-lg shadow-lg mb-4"
            >

              {item.is ? (

                isYoutube ||
                isDrive ? (

                  <div
                    className={`relative w-full ${aspectClass}`}
                  >
                    <iframe
                      src={mediaUrl}
                      title={
                        item.title ||
                        ""
                      }
                      className="absolute inset-0 w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>

                ) : (

                  <video
                     src={mediaUrl}
  playsInline
  preload="metadata"
  onClick={(e) => {
    if (e.target.paused) {
      e.target.play();
    } else {
      e.target.pause();
    }
  }}
  className="w-full"
                  />

                )

              ) : (

                <img
                  src={mediaUrl}
                  alt={
                    item.title ||
                    "Media"
                  }
                  className="w-full h-auto object-cover"
                  loading="lazy"
                  onError={(e) => {
                    e.target.src =
                      "/fallback.png";
                  }}
                />

              )}

            </div>

          );
        })}

      </Masonry>

    </div>
  );
};

export default Home;
