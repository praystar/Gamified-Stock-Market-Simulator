import React, { useState } from "react";

const videos = [
    {
      id: 1,
      title: "Stock Market For Beginners | How To Invest (Step by Step Tutorial)",
      url: "https://www.youtube.com/watch?v=J3fAI3al08Q",
      thumbnail: "https://img.youtube.com/vi/J3fAI3al08Q/0.jpg"
    },
    {
      id: 2,
      title: "Stock Market Investing Full Course For Beginners (2025)",
      url: "https://www.youtube.com/watch?v=W-Sx_9QElfw",
      thumbnail: "https://img.youtube.com/vi/W-Sx_9QElfw/0.jpg"
    },
    {
      id: 3,
      title: "The Ultimate Stock Market Course",
      url: "https://www.youtube.com/watch?v=Y3kzzE9Elns",
      thumbnail: "https://img.youtube.com/vi/Y3kzzE9Elns/0.jpg"
    },
    {
      id: 4,
      title: "Beginner's Guide To Successful Stock Market Investing",
      url: "https://www.youtube.com/watch?v=MG8mqrCUQWo",
      thumbnail: "https://img.youtube.com/vi/MG8mqrCUQWo/0.jpg"
    },
  { id: 5, title: "Learn React in 10 Minutes", url: "https://www.youtube.com/watch?v=Ke90Tje7VS0", thumbnail: "https://img.youtube.com/vi/Ke90Tje7VS0/0.jpg" },
  { id: 6, title: "JavaScript Crash Course", url: "https://www.youtube.com/watch?v=hdI2bqOjy3c", thumbnail: "https://img.youtube.com/vi/hdI2bqOjy3c/0.jpg" },
  { id: 7, title: "CSS Grid Tutorial", url: "https://www.youtube.com/watch?v=jV8B24rSN5o", thumbnail: "https://img.youtube.com/vi/jV8B24rSN5o/0.jpg" },
  { id: 8, title: "Mastering Flexbox", url: "https://www.youtube.com/watch?v=fYq5PXgSsbE", thumbnail: "https://img.youtube.com/vi/fYq5PXgSsbE/0.jpg" },
  { id: 9, title: "Understanding Async/Await", url: "https://www.youtube.com/watch?v=V_Kr9OSfDeU", thumbnail: "https://img.youtube.com/vi/V_Kr9OSfDeU/0.jpg" },
  { id: 10, title: "React Hooks Explained", url: "https://www.youtube.com/watch?v=TNhaISOUy6Q", thumbnail: "https://img.youtube.com/vi/TNhaISOUy6Q/0.jpg" },
  { id: 11, title: "Python for Beginners", url: "https://www.youtube.com/watch?v=_uQrJ0TkZlc", thumbnail: "https://img.youtube.com/vi/_uQrJ0TkZlc/0.jpg" },
  { id: 12, title: "Node.js Full Course", url: "https://www.youtube.com/watch?v=Oe421EPjeBE", thumbnail: "https://img.youtube.com/vi/Oe421EPjeBE/0.jpg" },
  { id: 13, title: "Intro to SQL", url: "https://www.youtube.com/watch?v=HXV3zeQKqGY", thumbnail: "https://img.youtube.com/vi/HXV3zeQKqGY/0.jpg" },
  { id: 14, title: "Django Crash Course", url: "https://www.youtube.com/watch?v=rHux0gMZ3Eg", thumbnail: "https://img.youtube.com/vi/rHux0gMZ3Eg/0.jpg" }
];

export default function Library() {
  const [searchTerm, setSearchTerm] = useState("");
  
  const filteredVideos = videos.filter(video =>
    video.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-gray-900 text-white min-h-screen p-6">
      <h1 className="text-3xl font-bold mb-6">Video Library</h1>
      <input
        type="text"
        placeholder="Search videos..."
        className="w-full p-2 mb-4 text-black bg-gray-700 rounded"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVideos.map(video => (
          <div key={video.id} className="bg-gray-800 p-4 rounded-lg shadow-lg">
            <a href={video.url} target="_blank" rel="noopener noreferrer">
              <img src={video.thumbnail} alt={video.title} className="w-full h-48 object-cover rounded" />
            </a>
            <h2 className="text-lg font-semibold mt-2">{video.title}</h2>
            <a href={video.url} target="_blank" rel="noopener noreferrer" 
               className="block bg-red-600 text-white text-center py-2 rounded hover:bg-red-700 transition mt-2">
              Watch on YouTube
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}