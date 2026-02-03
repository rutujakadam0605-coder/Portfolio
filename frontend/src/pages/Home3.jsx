import React, { useState, useEffect } from "react";
import axios from "axios";
import Masonry from "react-masonry-css";

const breakpointColumnsObj = { default: 4, 1100: 3, 700: 2, 500: 1 };

const Home = ({ selectedTag, searchQuery }) => {
  const [homeItems, setHomeItems] = useState([]);

  useEffect(() => {
    console.log("API BASE:", import.meta.env.VITE_API_BASE_URL);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/media");
        setHomeItems(res.data);
      } catch (err) {
        console.error("Failed to fetch media:", err);
      }
    };
    fetchData();
  }, []);

  const filteredItems = homeItems.filter(item => {
    if (selectedTag && selectedTag !== "All") {
      const typeMatch = ["graphic", "video", "uidesign", "logos"].includes(selectedTag.toLowerCase()) 
        ? item.type.toLowerCase() === selectedTag.toLowerCase()
        : item.tags.some(tag => tag.toLowerCase() === selectedTag.toLowerCase());
      if (!typeMatch) return false;
    }
    if (searchQuery && searchQuery.trim() !== "") {
      const queryMatch = item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      if (!queryMatch) return false;
    }
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <Masonry
        breakpointCols={breakpointColumnsObj}
        className="my-masonry-grid"
        columnClassName="my-masonry-grid_column"
      >
        {filteredItems.map(item => (
          <div key={item._id || item.url} className="overflow-hidden rounded-lg shadow-lg mb-4">
            {item.isVideo ? (
              <video
                src={item.url.startsWith("http") ? item.url : `http://localhost:5000${item.url}`}
                controls
                className="w-full h-auto object-cover"
              />
            ) : (
              <img
                src={item.url.startsWith("http") ? item.url : `http://localhost:5000${item.url}`}
                alt={item.title}
                className="w-full h-auto object-cover"
                onError={e => (e.target.src = "/fallback.png")}
              />
            )}
          </div>
        ))}
      </Masonry>
    </div>
  );
};

export default Home;
