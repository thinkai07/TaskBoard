// BackgroundChange.js
import React, { useState, useEffect } from "react";
import { AiOutlinePlus } from "react-icons/ai";
import { MdOutlineCancel } from "react-icons/md";
import axios from "axios";
import { server } from "../constant";
import { useLocation } from "react-router-dom";
import { ArrowRight } from 'lucide-react';

const BackgroundChange = ({ onClose, onSelectBackground }) => {
    const [customImages, setCustomImages] = useState([]);
    const [selectedImage, setSelectedImage] = useState(null);
    const [showSidebar, setShowSidebar] = useState(false);
    const location = useLocation();

    const handleSelectBackground = (image) => {
        const projectId = location.pathname.split("/")[2];
        setSelectedImage(image);
        axios
            .put(
                `${server}/api/projects/${projectId}/bgImage`,
                { bgUrl: image },
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

    // const images = [
    //     "https://cdn.wallpapersafari.com/22/64/hJ8vj7.jpg",
    //     "https://img1.wallspic.com/previews/2/4/8/1/21842/21842-world-globe-grasses-grass-energy-550x310.jpg",
    //     "https://images.all-free-download.com/images/graphiclarge/blue_sky_green_05_hd_picture_166201.jpg",
    //     "https://img.lovepik.com/element/40156/3639.png_1200.png",
    //     "https://img.lovepik.com/free-png/20211130/lovepik-tibetan-plateau-scenery-png-image_401215587_wh1200.png",
    //     "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSKUTxEMdd_dVPGsBPr9XddmYZzGNPT7GpoTA&s",
    //     ...customImages,
    // ];

    const images = [
        "https://images.pexels.com/photos/27724014/pexels-photo-27724014/free-photo-of-a-red-dragonfly-is-sitting-on-a-red-fire-hydrant.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
        "https://images.pexels.com/photos/2253573/pexels-photo-2253573.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
        "https://images.pexels.com/photos/406014/pexels-photo-406014.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
        "https://images.pexels.com/photos/325185/pexels-photo-325185.jpeg",

        ...customImages,
    ];

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            <div
                className="bg-white w-80 p-4 shadow-lg relative overflow-y-auto"
                style={{ maxHeight: "100vh" }}
            >
                <button
                    className="absolute top-4 left-4 p-2 rounded"
                    onClick={onClose}
                >
                    <ArrowRight size={30} />
                </button>

                <div className="mt-16">
                    <h3 className="text-xl font-semibold mb-4">Select Background</h3>
                    <hr className="border-gray-300 my-2" />

                    <div className="grid grid-cols-2 gap-4">
                        {images.map((image, index) => (
                            <img
                                key={index}
                                src={image}
                                alt={`Background ${index + 1}`}
                                className={`w-full border rounded-3xl h-32 object-cover mb-4 cursor-pointer ${selectedImage === image
                                    ? "border-2 border-black"
                                    : "border-gray-300"
                                    }`}
                                onClick={() => handleSelectBackground(image)}
                            />
                        ))}
                    </div>
                    <div className="flex items-center bg-gray-300 w-32 border rounded-3xl h-32 object-cover mb-4 justify-center mb-4">
                        <label htmlFor="file-upload" className="cursor-pointer">
                            <AiOutlinePlus size={30} />
                        </label>
                        <input
                            id="file-upload"
                            type="file"
                            className="hidden"
                            onChange={handleFileChange}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BackgroundChange;


