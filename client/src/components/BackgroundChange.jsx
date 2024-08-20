// BackgroundChange.js
import React, { useState, useEffect } from "react";
import { AiOutlinePlus } from "react-icons/ai";
import { MdOutlineCancel } from "react-icons/md";
import axios from "axios";
import { server } from "../constant";
import { useLocation } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { images as staticImages } from "../assets/Images";

const BackgroundChange = ({ onClose, onSelectBackground }) => {
  const [customImages, setCustomImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [unsplashImages, setUnsplashImages] = useState([]);
  const [showSidebar, setShowSidebar] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Fetch Unsplash images when the component mounts
    fetchUnsplashImages();
  }, []);

  const fetchUnsplashImages = async () => {
    try {
      const response = await axios.get(
        "https://api.unsplash.com/photos/random",
        {
          params: {
            count: 8,
            client_id: "rn5n3NUhw16AjjwCfCt3e1TKhiiKHCOxBdEp8E0c-KY", // Replace with your Unsplash API key
          },
        }
      );
      setUnsplashImages(response.data); // Store the entire image objects, not just the URLs
    } catch (error) {
      console.error("Error fetching Unsplash images:", error);
      setUnsplashImages(staticImages); // Adjust as necessary
    }
  };

  const handleSelectBackground = (image) => {
    const projectId = location.pathname.split("/")[2];
    setSelectedImage(image);

    const bgUrl = image
      ? {
          raw: image.urls.raw,
          thumb: image.urls.thumb,
          full: image.urls.full,
          regular: image.urls.regular,
        }
      : null;

    axios
      .put(
        `${server}/api/projects/${projectId}/bgImage`,
        { bgUrl },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      )
      .then((response) => {
        onSelectBackground(response.data.project.bgUrl);
      })
      .catch((error) => {
        console.error("Error updating background image:", error);
      });
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "g3smdj2n");

    try {
      const response = await axios.post(
        "https://api.cloudinary.com/v1_1/dygueetvc/image/upload",
        formData
      );

      const imageUrl = response.data.secure_url;
      const projectId = location.pathname.split("/")[2];

      const updateResponse = await axios.put(
        `${server}/api/projects/${projectId}/customImages`,
        { imageUrl },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setCustomImages((prevImages) => [...prevImages, imageUrl]);
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  };

  const images = [...unsplashImages, ...customImages];

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="bg-white w-80 p-4 shadow-lg relative overflow-y-auto"
        style={{ maxHeight: "100vh" }}
      >
        <button className="absolute top-4 left-4 p-2 rounded" onClick={onClose}>
          <ArrowRight size={30} />
        </button>

        <div className="mt-16">
          <h3 className="text-xl font-semibold mb-4">Select Background</h3>
          <hr className="border-gray-300 my-2" />

          <div className="grid grid-cols-2 gap-4">
            {images.map((image, index) => (
              <img
                key={index}
                src={image.urls.thumb}
                alt={`Background ${index + 1}`}
                className={`w-full border rounded-3xl h-32 object-cover mb-4 cursor-pointer ${
                  selectedImage === image
                    ? "border-2 border-black"
                    : "border-gray-300"
                }`}
                onClick={() => handleSelectBackground(image)}
              />
            ))}
          </div>
          {/* <div className="flex items-center bg-gray-300 w-32 border rounded-3xl h-32 object-cover mb-4 justify-center mb-4">
            <label htmlFor="file-upload" className="cursor-pointer">
              <AiOutlinePlus size={30} />
            </label>
            <input
              id="file-upload"
              type="file"
              className="hidden"
              onChange={handleFileChange}
            />
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default BackgroundChange;
