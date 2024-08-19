import { useState, useEffect, useRef } from "react";
import { MdOutlineCancel } from "react-icons/md";
import { AiOutlinePlus } from "react-icons/ai";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { Popover, Button } from "antd";
import { Bell, SquareChevronDown } from "lucide-react";
import { server } from "../constant";
import { BsMenuUp } from "react-icons/bs";
import { TbMenuOrder } from "react-icons/tb";

const Navbar = ({ user, onLogout, onSelectBackground, onSelectColor }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showSidebar, setShowSidebar] = useState(false);
  const [customImages, setCustomImages] = useState([]);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const location = useLocation();
  const notificationCount = notifications.filter(
    (notification) => !notification.readStatus
  ).length;
  const [organizationName, setOrganizationName] = useState("");
  const [userRole, setUserRole] = useState("");
  const [organizationId, setOrganizationId] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const userId = user?._id;
        if (!userId) {
          console.error("User ID is not available");
          return;
        }

        const response = await axios.post(
          `${server}/api/notifications/unread`,
          { userId },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (response.data.notifications) {
          setNotifications(response.data.notifications);
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    fetchNotifications();
  }, [user, server]);

  useEffect(() => {
    const fetchUserRoleAndOrganization = async () => {
      try {
        const response = await axios.get(`${server}/api/role`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setUserRole(response.data.role);
        setOrganizationId(response.data.organizationId);
        setOrganizationName(response.data.organizationName);
        console.log("org", response.data);
      } catch (error) {
        console.error("Error fetching user role:", error);
      }
    };
    fetchUserRoleAndOrganization();
  }, []);

  const handleNotificationClick = async (notificationId) => {
    try {
      await axios.patch(
        `${server}/api/notifications/${notificationId}`,
        { readStatus: true },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setNotifications((prevNotifications) =>
        prevNotifications.filter(
          (notification) => notification._id !== notificationId
        )
      );
    } catch (error) {
      console.error("Error updating notification read status:", error);
    }
  };

  const formatDate = (date) => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const day = days[date.getDay()];
    const dayOfMonth = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${dayOfMonth}-${month}-${year}, ${day}`;
  };

  const confirmLogout = () => {
    onLogout();
    setShowLogoutConfirmation(false);
  };

  const cancelLogout = () => {
    setShowLogoutConfirmation(false);
  };

  const handleOpenSidebar = () => {
    setShowSidebar(true);
  };

  const handleCloseSidebar = () => {
    setShowSidebar(false);
  };

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

  const getFirstLetter = () => {
    return user?.email ? user.email.charAt(0).toUpperCase() : "";
  };

  const isProjectRoute = location.pathname.startsWith("/projects/");

  const images = [
    "https://png.pngtree.com/background/20230425/original/pngtree-pine-forest-with-green-trees-and-blue-sky-photo-picture-image_2473099.jpg",
    "https://images.all-free-download.com/images/graphiclarge/blue_sky_green_05_hd_picture_166201.jpg",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSKUTxEMdd_dVPGsBPr9XddmYZzGNPT7GpoTA&s",
    ...customImages,
  ];

  const profileContent = (
    <div className="w-60  ">
      <div className="px-4 py-2 text-sm text-gray-700">{user?.email}</div>
      <div className="border-t"></div>
      {showLogoutConfirmation ? (
        <div className="">
          <p className="text-sm justify-center items-center mb-2">
            Are you sure you want to logout?
          </p>
          <div className="flex justify-between space-x-2">
            <Button
              onClick={confirmLogout}
              className="bg-red-500 text-white hover:bg-red-600 transition-colors text-sm"
            >
              Yes
            </Button>
            <Button
              onClick={cancelLogout}
              className="bg-gray-500 text-white hover:bg-gray-600 transition-colors text-sm"
            >
              No
            </Button>
          </div>
        </div>
      ) : (
        <Button
          onClick={() => setShowLogoutConfirmation(true)}
          className=" w-full text-left px-4 py-2 text-sm text-gray-700 "
        >
          Logout
        </Button>
      )}
    </div>
  );

  return (
    <div className="flex items-center justify-between h-14 text-base p-4 sticky top-0 z-10 border-1 shadow-sm">
      <div className="flex items-center">
        <div className="ml-3">
          <h1 className="font-semibold text-2xl">HI! {user?.name}</h1>
          <h3 className="font-medium text-md">
            <span className="text-gray-500">{formatDate(currentTime)}</span>
          </h3>
        </div>
      </div>

      <div className="flex items-center flex-grow justify-center space-x-20">
        <div className="relative w-full max-w-xs"> </div>
      </div>
      <h1 className="font-semibold text-1xl m-4">{organizationName}</h1>

      {isProjectRoute && (
        <div className="relative inline-block group">
          <button
            className="text-black text-xl hover:text-gray-800 hover:bg-gray-200 focus:outline-none p-1 rounded-full mr-4"
            onClick={handleOpenSidebar}
          >
            {/* <SquareChevronDown size={20} /> */}
          </button>
          <span className="invisible absolute right-full bg-gray-700 text-white text-sm rounded opacity-0 transition-opacity duration-300 group-hover:visible group-hover:opacity-100">
            Change background
          </span>
        </div>
      )}

      <Popover
        placement="bottomRight"
        title="Notifications"
        content={
          <div
            style={{ maxHeight: "350px", overflowY: "auto", width: "400px" }}
          >
            {notifications.length === 0 ? (
              <p className="text-gray-500">No notifications</p>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification._id}
                  className="flex items-start mb-4 cursor-pointer hover:bg-gray-100 transition-colors border rounded-xl py-2 px-2"
                  onClick={() => handleNotificationClick(notification._id)}
                >
                  <div className="w-10 h-10 bg-blue-500 text-white flex items-center justify-center rounded-full mr-4 flex-shrink-0">
                    {notification.assignedByEmail.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-gray-700">
                    <p>
                      <strong>{notification.assignedByEmail}</strong>{" "}
                      {notification.message}
                    </p>
                    {notification.createdAt && (
                      <div className="text-sm text-gray-500">
                        {new Date(notification.createdAt).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "numeric",
                            minute: "numeric",
                            hour12: true,
                          }
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        }
        trigger="click"
      >
        <div className="relative hover:text-gray-800 hover:bg-gray-200 focus:outline-none p-1 rounded-full mr-4">
          <Bell size={20} className="cursor-pointer text-gray-700" />
          {notificationCount > 0 && (
            <span className="absolute top-0 left-4 bg-red-500 text-white text-xs font-semibold rounded-full w-4 mr-0 mb-6 h-4 flex items-center justify-center">
              {notificationCount}
            </span>
          )}
        </div>
      </Popover>

      <Popover
        placement="bottomRight"
        content={profileContent}
        trigger="click"
      >
        <div className="w-8 h-8 bg-[#8AAAE5] text-white flex items-center justify-center rounded-full font-semibold text-xl cursor-pointer">
          {getFirstLetter()}
        </div>
      </Popover>

      {showSidebar && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="bg-transparent w-80 p-4 rounded-tl-3xl shadow-lg relative overflow-y-auto"
            style={{ maxHeight: "100vh", backdropFilter: "blur(10px)" }}
          >
            <button
              className="absolute top-4 right-4 p-2 rounded"
              onClick={handleCloseSidebar}
            >
              <MdOutlineCancel size={30} />
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
                    className={`w-full border rounded-3xl h-32 object-cover mb-4 cursor-pointer ${
                      selectedImage === image
                        ? "border-4 border-green-500"
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
      )}
    </div>
  );
};

export default Navbar;