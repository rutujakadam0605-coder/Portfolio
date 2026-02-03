// src/pages/Portfolio.js
import React, { useEffect, useState } from "react";
import axios from "axios";

function Portfolio() {
  const [media, setMedia] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/api/media")
      .then(res => setMedia(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="portfolio">
      <h2>My Portfolio</h2>
      <div className="grid">
        {media.map(item => (
          <div key={item._id} className="card">
            <img src={item.imageUrl} alt={item.title} />
            <h3>{item.title}</h3>
            <p>{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Portfolio;
