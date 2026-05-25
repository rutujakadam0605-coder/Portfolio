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

  /* ================= FETCH MEDIA ================= */

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

  /* ================= MEDIA UPLOAD ================= */

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

      if (file) {
        const formData =
          new FormData();

        formData.append(
          "file",
          file
        );

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

        showNotification(
          "✅ File uploaded successfully"
        );

      } else {

        await axios.post(
          `${API_BASE}/api/media/upload-url`,
          {
            title:
              externalUrl
                .split("/")
                .pop(),

            type:
              type.toLowerCase(),

            tags,

            url:
              externalUrl,

            isVideo:
              type === "Video",
          }
        );

        showNotification(
          "✅ External media added"
        );
      }

      setFile(null);
      setExternalUrl("");
      setTags([]);

      fetchMedia();

    } catch (err) {

      console.error(
        "UPLOAD ERROR:",
        err?.response?.data || err
      );

      showNotification(
        "❌ Upload failed"
      );
    }
  };

  /* ================= DELETE ================= */

  const handleDelete = async (id) => {
    try {

      await axios.delete(
        `${API_BASE}/api/media/${id}`
      );

      setMedia((prev) =>
        prev.filter(
          (m) =>
            m._id !== id
        )
      );

      showNotification(
        "🗑 Deleted successfully"
      );

    } catch (err) {
      console.error(err);

      showNotification(
        "❌ Delete failed"
      );
    }
  };

  /* ================= BROCHURE ================= */

  const handleBrochureUpload = async (e) => {
    e.preventDefault();

    const brochureFile =
      e.target.brochure.files[0];

    if (!brochureFile) {
      return showNotification(
        "Please select PDF brochure"
      );
    }

    const formData =
      new FormData();

    formData.append(
      "file",
      brochureFile
    );

    try {

      await axios.post(
        `${API_BASE}/api/brochure/upload`,
        formData,
        {
          headers: {
            "Content-Type":
              "multipart/form-data",
          },
        }
      );

      showNotification(
        "📄 Brochure uploaded"
      );

    } catch (err) {

      console.error(err);

      showNotification(
        "❌ Brochure upload failed"
      );
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto text-white">

      <h1 className="text-2xl font-bold mb-4">
        Admin Dashboard
      </h1>

      {notification && (
        <div className="fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded shadow-lg z-50">
          {notification}
        </div>
      )}

      {/* BROCHURE */}

      <form
        onSubmit={handleBrochureUpload}
        className="mb-8 p-4 bg-gray-900 border border-yellow-500 rounded"
      >
        <h2 className="text-lg font-semibold mb-2 text-yellow-400">
          Upload / Replace Brochure (PDF)
        </h2>

        <input
          type="file"
          name="brochure"
          accept="application/pdf"
          className="block mb-3 text-sm text-gray-300"
        />

        <button
          type="submit"
          className="bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded"
        >
          Upload Brochure
        </button>

      </form>

      {/* MEDIA */}

      <form
        onSubmit={handleUpload}
        className="mb-6 space-y-4 p-4 bg-gray-800 rounded"
      >

        <select
          value={type}
          onChange={(e) => {
            setType(e.target.value);
            setTags([]);
          }}
          className="border p-2 w-full rounded text-white bg-gray-700"
        >
          {Object.keys(typeOptions).map((t) => (
            <option
              key={t}
              value={t}
            >
              {t}
            </option>
          ))}
        </select>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-gray-700 p-2 rounded">

          {typeOptions[type].map((tg) => (
            <label
              key={tg}
              className="flex items-center space-x-2"
            >
              <input
                type="checkbox"
                checked={tags.includes(tg)}
                onChange={(e) =>
                  e.target.checked
                    ? setTags([
                        ...tags,
                        tg,
                      ])
                    : setTags(
                        tags.filter(
                          (t) =>
                            t !== tg
                        )
                      )
                }
              />

              <span>
                {tg}
              </span>
            </label>
          ))}

        </div>

        <input
          type="file"
          onChange={(e) =>
            setFile(
              e.target.files[0]
            )
          }
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
          Upload Media
        </button>

      </form>

      {/* GALLERY */}

      <Masonry
        breakpointCols={breakpointColumnsObj}
        className="my-masonry-grid"
        columnClassName="my-masonry-grid_column"
      >
        {media.map((item) => {

          const mediaUrl =
            item.url.startsWith("http")
              ? item.url
              : `${API_BASE}${item.url}`;

          return (
            <div
              key={item._id}
              className="bg-gray-700 rounded overflow-hidden mb-4"
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
                  alt={item.title}
                  className="w-full"
                />
              )}

              <div className="p-2">

                <p>{item.title}</p>

                <button
                  onClick={() =>
                    handleDelete(
                      item._id
                    )
                  }
                  className="bg-red-500 px-2 py-1 mt-2 rounded"
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
