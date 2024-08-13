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
// import { AiOutlineBell } from "react-icons/ai";
const Navbar = ({ user, onLogout, onSelectBackground, onSelectColor }) => {
  // console.log(user)
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [customImages, setCustomImages] = useState([]);
  const profileDropdownRef = useRef(null);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const location = useLocation();
  const notificationCount = notifications.filter(
    (notification) => !notification.readStatus
  ).length;
  const [organizationName, setOrganizationName] = useState("");
  const [userRole, setUserRole] = useState("");
  const [organizationId, setOrganizationId] = useState("");
  const [selectedImage, setSelectedImage] = useState(null); //added
  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target)
      ) {
        setShowProfileDropdown(false);
        setShowLogoutConfirmation(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
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
          `${server}/api/notifications/unread`, // Assume this endpoint fetches only unread notifications
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

      // Remove the notification from the state after marking it as read
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
    const month = (date.getMonth() + 1).toString().padStart(2, "0"); // months are 0-indexed
    const year = date.getFullYear();
    return `${dayOfMonth}-${month}-${year}, ${day}`;
  };

  const handleLogoutClick = () => {
    setShowLogoutConfirmation(true);
    setShowProfileDropdown(false); // Close profile dropdown when logout confirmation opens
  };

  const confirmLogout = () => {
    onLogout();
    setShowLogoutConfirmation(false);
  };

  const cancelLogout = () => {
    setShowLogoutConfirmation(false);
  };

  const toggleProfileDropdown = () => {
    setShowProfileDropdown(!showProfileDropdown);
    setShowLogoutConfirmation(false); // Close logout confirmation when profile dropdown opens
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
  const toggleNotificationModal = () => {
    setShowNotificationModal(!showNotificationModal);
  };
  const handleSetReload = () => {
    window.location.reload();
  };

  const images = [
    "https://png.pngtree.com/background/20230425/original/pngtree-pine-forest-with-green-trees-and-blue-sky-photo-picture-image_2473099.jpg",
    "https://images.all-free-download.com/images/graphiclarge/blue_sky_green_05_hd_picture_166201.jpg",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSKUTxEMdd_dVPGsBPr9XddmYZzGNPT7GpoTA&s",

    ...customImages,
  ];

  // const images = [
  //   // "https://img.lovepik.com/element/40156/3639.png_1200.png",
  //   // "https://img.lovepik.com/free-png/20211130/lovepik-tibetan-plateau-scenery-png-image_401215587_wh1200.png",
  //   "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBwgHBgkIBwgKCgkLDRYPDQwMDRsUFRAWIB0iIiAdHx8kKDQsJCYxJx8fLT0tMTU3Ojo6Iys/RD84QzQ5OjcBCgoKDQwNGg8PGjclHyU3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3N//AABEIAJQBAAMBIgACEQEDEQH/xAAaAAEBAQEBAQEAAAAAAAAAAAABAAIDBQQG/8QAGxABAQEAAgMAAAAAAAAAAAAAAAERITECEkH/xAAaAQEBAQEBAQEAAAAAAAAAAAABAAIEAwUG/8QAGBEBAQEBAQAAAAAAAAAAAAAAABEBAhL/2gAMAwEAAhEDEQA/AP2EhxrD6v0Ffj/TOLGsWCqsrGsViFZFaxE1lFJUI4kaziKRoRRVAKRoRSNCKRqSSVSSSqSSNSwpKs4rGhUa7Ycaw4865WMGN4sVTGKxrBSqyqViVAsaCVZxY0iqwjixGs4msBNCKSoRSNCKRoRSNCKRoRSVQKSoVIqNfXhxrE8a8oxgsbwWcGjWBY3gprLFgbopDOLCkmQ0iqyiEqBhRVGIjEc0I4sRoRSNCOLEaEcRNBWIGpJYlQsOLEX34MdMDnpjGDG8FNZ3GMZsdGbDWY52JuwVqsbjAxrAaGcDYxDWWW8BwM4mgUA1gwkIpKijGkjREQjUUkaBjSSoxFJqoWFJV6WDG8Dkro8sYLGxhrO4xYLG7BjVY3GLGbHTBYaxuOdgsdKzYazuMXgN0NMsUY1YlRrGDG8GEM4K1iw1Moo1BHFipCKRCKRCKRCKSCKxVp6mLGw43bHPBXSxmxqs7yxYLG8Cee8sYLG6LGmdxjBjdZsLG4xYy6YMarG4xjLpgw1ncYFjbOGs7jOBvBZwqGKmrBmGhlNBEIokIpEIpEFFEIpF6+DG8GOKvp7jFjNjpjNhrG4zjNjpYMNY3HOxmumCxqsbjFjON4MNY3GLBjeDCxGMGN2DGqxuMYMbwYWdxihrBhEZwWN4LCIxYsasWKiM4GrFhTKOLEQikQUU1AGhUntYMbwY4a+vGMFjeCws7jGM2OljGNMbgZsbopee452Cx0sZw1jcYsGNjCxGMGN4LCzuMWDG8GFiMWDG8GFmMYrGrBhEZsFjWKw0RjBjeDDVGU0MSjJKJgRSIvQaHl0k9tHDjgfajGCxvBSzuOdgxvBjTG4xjOOmQYWNxgWNUU157jGCxpYazGBjWAsbjODGsGFiM4LG8FhZ3liwWNiw1ncYwWN2MkQYMaWERixY1iw1MrGsCpgwN4MVUZxNYzUtx7iScT7YVnCSGsjEixrNCTTz0D4kWNZwJFgBIs6Ak0wMFiSZ1YKkWdFFCLKCRCBSQRRIVSSDNSI1/9k=",
  //   // "https://i.pinimg.com/originals/b9/df/24/b9df243c15b372d33ade268c538dde2d.jpg",
  //   "data:image/jpeg;base64,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",
  //   // "https://besthqwallpapers.com/Uploads/11-11-2019/111139/white-wood-boards-4k-macro-white-wooden-texture-wooden-lines.jpg",

  //   "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQYAAACUCAMAAABGMnfyAAAAA1BMVEWt2eZvScryAAAAPElEQVR4nO3BAQ0AAADCoPdPbQ8HFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB8G5gMAAGN/kBAAAAAAElFTkSuQmCC",

  //   ...customImages,
  // ];

  const isProjectRoute = location.pathname.startsWith("/projects/");

  return (
    <div className="flex items-center justify-between h-14 text-base p-4 sticky top-0 z-10  border-1 shadow-sm">
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
            className="text-black text-xl   hover:text-gray-800 hover:bg-gray-200 focus:outline-none p-1 rounded-full mr-4"
            onClick={handleOpenSidebar}
          >
            <SquareChevronDown size={20} />
          </button>
          <span className="invisible absolute right-full  bg-gray-700 text-white text-sm rounded opacity-0 transition-opacity duration-300 group-hover:visible group-hover:opacity-100">
            Change background
          </span>
        </div>
      )}
      {/* <div className="relative  hover:text-gray-800 hover:bg-gray-200 focus:outline-none p-1 rounded-full mr-4">
        <AiOutlineBell
          size={25}
          className="cursor-pointer  text-gray-700"
          onClick={toggleNotificationModal}
        />
        {notificationCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full w-4 mr-2 mb-6 h-4 flex items-center justify-center">
            {notificationCount}
          </span>
        )}
      </div> */}
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

      <div
        className="w-8 h-8 bg-[#8AAAE5] text-white flex items-center justify-center rounded-full font-semibold text-xl cursor-pointer"
        onClick={toggleProfileDropdown}
      >
        {getFirstLetter()}
      </div>

      {showProfileDropdown && (
        <div ref={profileDropdownRef} className="ml-2 absolute top-20 right-4">
          <div className="w-60 bg-white border border-gray-300 rounded-2xl shadow-xl">
            <div className="px-4 py-2 text-sm text-gray-700">{user?.email}</div>
            {/* <div className="px-4 py-2 text-sm text-gray-700">{user?.name}</div> */}
            <div className="border-t border-gray-300"></div>
            {showLogoutConfirmation ? (
              <div className="px-4 py-2">
                <p className="text-sm justify-center items-center mb-2">
                  Are you sure want to logout?
                </p>
                <div className="flex justify-between space-x-2">
                  <button
                    onClick={confirmLogout}
                    className="bg-red-500 text-white px-4 py-1 rounded-3xl hover:bg-red-600 transition-colors text-sm"
                  >
                    Yes
                  </button>
                  <button
                    onClick={cancelLogout}
                    className="bg-gray-500 text-white px-4 py-1 rounded-3xl hover:bg-gray-600 transition-colors text-sm"
                  >
                    No
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowLogoutConfirmation(true)}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-b-2xl"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      )}

      {showSidebar && (
        <div className="fixed inset-0  z-50 flex justify-end">
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

              {/* {selectedImage && (
                <button
                  onClick={handleSetReload}
                  className="bg-green-500 text-white py-2 px-4 rounded-xl mt-4"
                >
                  Set as Background Image
                </button>
              )} */}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;