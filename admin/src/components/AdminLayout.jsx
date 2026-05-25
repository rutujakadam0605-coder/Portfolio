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

const typeOptions = {
  Graphic: ["illustration", "poster", "flyer", "digital art"],
  Video: ["intro", "trailer", "ad", "animation"],
  UiDesign: ["wireframe", "mockup", "landingpage", "prototype"],
  Logos: ["minimal", "vintage", "mascot", "typography"],
  presentation: [
    "All",
    "Crypto",
    "Forex",
    "RealEstate",
    "Agriculture",
    "Corporate",
  ],
};

const AdminLayout = () => {
  const [media, setMedia] = useState([]);
  const [type, setType] = useState("Graphic");
  const [tags, setTags] = useState([]);
  const [file, setFile] = useState(null);
  const [externalUrl, setExternalUrl] = useState("");
  const [notification, setNotification] = useState("");

  const showNotification = (msg) => {
    setNotification(msg);

    setTimeout(() => {
      setNotification("");
    }, 3000);
  };

  /* ================= FETCH ================= */

  const fetchMedia = async () => {
    try {
      const res = await axios.get(
        `${API_BASE}/api/media`
      );

      setMedia(res.data || []);

    } catch (err) {
      console.error(err);

      showNotification(
        "❌ Failed to fetch media"
      );
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  /* ================= UPLOAD ================= */

  const handleUpload = async (e) => {
    e.preventDefault();

    try {
      if (!file && !externalUrl) {
        return showNotification(
          "Select file or URL"
        );
      }

      if (!tags.length) {
        return showNotification(
          "Select at least one tag"
        );
      }

      /* FILE UPLOAD */

      if (file) {
        const formData =
          new FormData();

        formData.append(
          "file",
          file
        );

        // important fix
        formData.append(
          "title",
          file.name.split(".")[0]
        );

        formData.append(
          "type",
          type.toLowerCase()
        );

        formData.append(
          "tags",
          tags.join(",")
        );

        formData.append(
          "isVideo",
          type === "Video"
        );

        const res =
          await axios.post(
            `${API_BASE}/api/media/upload`,
            formData,
            {
              headers: {
                "Content-Type":
                  "multipart/form-data",
              },
            }
          );

        console.log(
          "UPLOAD RESPONSE:",
          res.data
        );

        showNotification(
          "✅ File uploaded"
        );

      } else {

        /* URL upload */

        await axios.post(
          `${API_BASE}/api/media/upload-url`,
          {
            title:
              externalUrl.split("/").pop(),

            type:
              type.toLowerCase(),

            tags,

            url: externalUrl,

            isVideo:
              type === "Video",
          }
        );

        showNotification(
          "✅ URL added"
        );
      }

      setFile(null);
      setExternalUrl("");
      setTags([]);

      fetchMedia();

    } catch (err) {

      console.error(
        "UPLOAD ERROR:"
      );

      console.error(err);

      console.log(
        err?.response?.data
      );

      showNotification(
        "❌ Upload failed"
      );
    }
  };

  /* ================= DELETE ================= */

  const handleDelete = async (
    id
  ) => {
    try {
      await axios.delete(
        `${API_BASE}/api/media/${id}`
      );

      setMedia((prev) =>
        prev.filter(
          (m) => m._id !== id
        )
      );

      showNotification(
        "🗑 Deleted"
      );

    } catch (err) {
      console.error(err);

      showNotification(
        "❌ Delete failed"
      );
    }
  };

  /* ================= UI ================= */

  return (
    <div className="p-8 max-w-6xl mx-auto text-white">

      <h1 className="text-2xl font-bold mb-4">
        Admin Dashboard
      </h1>

      {notification && (
        <div className="fixed top-4 right-4 bg-green-600 px-4 py-2 rounded z-50">
          {notification}
        </div>
      )}

      <form
        onSubmit={handleUpload}
        className="space-y-4 p-4 bg-gray-800 rounded mb-6"
      >

        <select
          value={type}
          onChange={(e) => {
            setType(
              e.target.value
            );

            setTags([]);
          }}
          className="w-full p-2 bg-gray-700 rounded"
        >
          {Object.keys(
            typeOptions
          ).map((t) => (
            <option
              key={t}
              value={t}
            >
              {t}
            </option>
          ))}
        </select>

        <div className="grid grid-cols-2 gap-2">

          {typeOptions[type].map(
            (tag) => (
              <label
                key={tag}
              >
                <input
                  type="checkbox"
                  checked={tags.includes(
                    tag
                  )}
                  onChange={(
                    e
                  ) =>
                    e.target
                      .checked
                      ? setTags([
                          ...tags,
                          tag,
                        ])
                      : setTags(
                          tags.filter(
                            (
                              t
                            ) =>
                              t !==
                              tag
                          )
                        )
                  }
                />

                <span className="ml-2">
                  {tag}
                </span>
              </label>
            )
          )}

        </div>

        <input
          type="file"
          onChange={(e) =>
            setFile(
              e.target
                .files[0]
            )
          }
          className="w-full"
        />

        <input
          type="url"
          placeholder="External URL"
          value={externalUrl}
          onChange={(e) =>
            setExternalUrl(
              e.target.value
            )
          }
          className="w-full p-2 rounded bg-gray-700"
        />

        <button
          className="bg-blue-600 px-4 py-2 rounded"
        >
          Upload
        </button>

      </form>

      <Masonry
        breakpointCols={
          breakpointColumnsObj
        }
        className="my-masonry-grid"
        columnClassName="my-masonry-grid_column"
      >

        {media.map((item) => {

          const mediaUrl =
            item.url.startsWith(
              "http"
            )
              ? item.url
              : `${API_BASE}${item.url}`;

          return (
            <div
              key={item._id}
              className="bg-gray-800 rounded overflow-hidden mb-4"
            >

              {item.isVideo ? (
                <video
                  src={mediaUrl}
                  controls
                  className="w-full"
                />
              ) : (
                <img
                  src={mediaUrl}
                  alt=""
                  className="w-full"
                />
              )}

              <div className="p-2">

                <p>
                  {item.title}
                </p>

                <button
                  onClick={() =>
                    handleDelete(
                      item._id
                    )
                  }
                  className="bg-red-500 px-2 py-1 rounded mt-2"
                >
                  Delete
                </button>

              </div>

            </div>
          );
        })}

      </Masonry>

    </div>
  );
};

export default AdminLayout;
