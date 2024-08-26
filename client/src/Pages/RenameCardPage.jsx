import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Input, Button, Progress, Typography, List, Avatar, Tabs,Tooltip } from 'antd';
import axios from 'axios';
import { server } from '../constant';
import { CloseOutlined, CommentOutlined } from "@ant-design/icons";

const initialBoard = {
  columns: [],
};
const RenameCardPage = () => {
  const {columnId, cardId } = useParams();
  const { Text, Title } = Typography; // Correct import from Typography
  const { TextArea } = Input;

  // State for storing card details
  const [cardData, setCardData] = useState({
    projectName:'',
    name: '',
    description: '',
    projectName: '',
    assignedTo: '',
    createdBy: '',
    dueDate: null,
    estimatedHours: 0,
    utilizedHours: 0,
    remainingHours: 0,
    activities: [],
    taskLogs: [],
    comments: []
  });
  const [boardData, setBoardData] = useState(initialBoard);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [userComment, setUserComment] = useState('');
  const [commentsVisible, setCommentsVisible] = useState(true);
  const [renameCardErrors, setRenameCardErrors] = useState({ title: "", description: "" });
  const [renameCardModalVisible, setRenameCardModalVisible] = useState(false);
  const [renameCardTitle, setRenameCardTitle] = useState("");
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [renameCardDescription, setRenameCardDescription] = useState("");
  const [selectedCardId, setSelectedCardId] = useState(null);
  const [selectedColumnId, setSelectedColumnId] = useState(null);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  
  // Fetch card details on component mount
 
  const fetchCardDetails = async () => {
    try {
      const response = await axios.get(`${server}/api/tasks/${columnId}/cards`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
  
      // Destructure taskName and cards from the response
      const { taskName, cards } = response.data;
  
      // Find the specific card by `cardId` within the cards array
      const cardData = cards.find(card => card.id === cardId);
  
      if (cardData) {
        setCardData({
          ...cardData,
          remainingHours: (cardData.estimatedHours || 0) - (cardData.utilizedHours || 0),
          taskName, // Add taskName to the cardData state
        });
      } else {
        console.error('Card not found');
      }
    } catch (error) {
      console.error('Error fetching card details:', error);
    }
  };
  
  useEffect(() => {
    fetchCardDetails();
  }, [cardId]);
  


    useEffect(() => {
    fetchCardDetails();
  }, [cardId]);

 
  const fetchUserEmail = async () => {
    try {
      const response = await axios.get(`${server}/api/user`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const userEmail = response.data.user.email;
      setUserEmail(userEmail);
      return userEmail; // Return the email
    } catch (error) {
      console.error("Error fetching user data:", error);
      throw error; // Rethrow the error so it can be handled in the calling function
    }
  };
  
    useEffect(() => {
    fetchUserEmail();
  }, []);


  const handleRenameCardTitle = async () => {
    const trimmedTitle = cardData.name.trim();
    if (!trimmedTitle) {
      setRenameCardErrors((prev) => ({ ...prev, name: "Please enter a card title" }));
      return;
    }
  
    try {
      const updatedBy = await fetchUserEmail(); // Get the email from fetchUserEmail
  
      const response = await fetch(
        `${server}/api/tasks/${columnId}/cards/${cardId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            name: trimmedTitle,
            updatedBy: updatedBy, // Save the email in the updatedBy field
            updatedDate: new Date().toISOString(),
          }),
        }
      );
  
      if (!response.ok) {
        throw new Error("Failed to rename card title");
      }
  
      // Update local state
      setBoardData((prevState) => {
        const updatedColumns = prevState.columns.map((column) => {
          if (column.id === columnId) {
            return {
              ...column,
              cards: column.cards.map((card) =>
                card.id === cardId
                  ? {
                      ...card,
                      title: trimmedTitle,
                    }
                  : card
              ),
            };
          }
          return column;
        });
  
        return { ...prevState, columns: updatedColumns };
      });
  
      setRenameCardErrors((prev) => ({ ...prev, name: "" }));
      setIsEditingTitle(false);
    } catch (error) {
      console.error("Error renaming card title:", error);
    }
  };
  
  
  const handleRenameCardDescription = async () => {
    const trimmedDescription = cardData.description.trim();
    if (!trimmedDescription) {
      setRenameCardErrors((prev) => ({ ...prev, description: "Please enter a card description" }));
      return;
    }
  
    try {
      const updatedBy = await fetchUserEmail(); // Get the email from fetchUserEmail
  
      const response = await fetch(
        `${server}/api/tasks/${columnId}/cards/${cardId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            description: trimmedDescription,
            updatedBy: updatedBy, // Save the email in the updatedBy field
            updatedDate: new Date().toISOString(),
          }),
        }
      );
  
      if (!response.ok) {
        throw new Error("Failed to rename card description");
      }
  
      // Update local state
      setBoardData((prevState) => {
        const updatedColumns = prevState.columns.map((column) => {
          if (column.id === columnId) {
            return {
              ...column,
              cards: column.cards.map((card) =>
                card.id === cardId
                  ? {
                      ...card,
                      description: trimmedDescription,
                    }
                  : card
              ),
            };
          }
          return column;
        });
  
        return { ...prevState, columns: updatedColumns };
      });
  
      setRenameCardErrors((prev) => ({ ...prev, description: "" }));
      setIsEditingDescription(false);
    } catch (error) {
      console.error("Error renaming card description:", error);
    }
  };


  const handleTitleBlur = () => {
    handleRenameCardTitle(); // Call your handler for renaming title
    setIsEditingTitle(false); // Exit title editing mode
  };

  const handleDescriptionBlur = () => {
    handleRenameCardDescription(); // Call your handler for renaming description
    setIsEditingDescription(false); // Exit description editing mode
  };
  
 
  useEffect(() => {
    console.log('Card Data State:', cardData);
  }, [cardData]);

  const handleSaveComment = async () => {
    try {
      const response = await axios.post(
        `${server}/api/card/${cardId}/comments`,
        {
          comment: userComment,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
  
      // Extract the new comment from the response
      const newComment = response.data.comment;
  
      // Update the cardData state with the new comment
      setCardData((prevCardData) => ({
        ...prevCardData,
        comments: [...prevCardData.comments, newComment], // Add the new comment to the existing comments
      }));
  
      // Clear the input field and ensure the comments section is visible
      setUserComment("");
      setCommentsVisible(true);
    } catch (error) {
      console.error("Error saving comment:", error);
    }
  };
  
  

  const items = [
    {
      key: "1",
  label: "Activities",
  children: (
    <div className="mt-4 h-96 overflow-y-auto">
      {cardData.activities.length > 0 ? (
        <List
          dataSource={cardData.activities}
          renderItem={(activity, idx) => (
            <List.Item
              key={activity._id} // Use _id for uniqueness
              className={`ml-2 text-gray-700 mt-2 ${
                idx === 0 ? "bg-gray-100" : "bg-white"
              }`}
            >
              <List.Item.Meta
                avatar={
                  <Avatar style={{ backgroundColor: "#1890ff" }}>
                    {activity.commentBy[0].toUpperCase()}
                  </Avatar>
                }
                title={<strong>{activity.commentBy}</strong>}
                description={
                  <>
                    <div>{activity.comment}</div>
                    <div className="text-gray-500 text-sm">
                      {new Date(activity.createdAt).toLocaleString()}
                    </div>
                  </>
                }
              />
            </List.Item>
          )}
        />
      ) : (
        <Text>No activities found.</Text>
      )}
    </div>
  ),
    },
    {
      key: "2",
      label: "Log-in Hours",
      children: (
        <div className="mt-4 h-96 overflow-y-auto">
          {cardData.taskLogs.length > 0 ? (
            <List
              dataSource={cardData.taskLogs}
              renderItem={(taskLog, idx) => (
                <List.Item
                  key={taskLog._id} // Use _id for uniqueness
                  className={`ml-2 text-gray-700 mt-2 ${
                    idx === 0 ? "bg-gray-100" : "bg-white"
                  }`}
                >
                  <List.Item.Meta
                    avatar={
                      <Avatar style={{ backgroundColor: "#1890ff" }}>
                        {taskLog.loggedBy.name[0].toUpperCase()}
                      </Avatar>
                    }
                    title={<strong>{taskLog.loggedBy.name}</strong>}
                    description={
                      <>
                        <div>{taskLog.hours}</div>
                        <div className="text-gray-500 text-sm">
                          {new Date(taskLog.createdAt).toLocaleString()}
                        </div>
                      </>
                    }
                  />
                </List.Item>
              )}
            />
          ) : (
            <Text>No log-in hours found.</Text>
          )}
        </div>
      ),
    },
    {
      key: "3",
      label: "Comments",
      children: (
        <div className="mt-4 h-96 overflow-y-auto">
          <div className="flex items-center mb-4 pt-6">
            <CommentOutlined className="mr-2" />
            <Title level={4}>Comments</Title>
          </div>
    
          <div className="flex items-center mb-2">
            <Avatar style={{ backgroundColor: "#1890ff" }}>
              {cardData.assignedTo.charAt(0).toUpperCase()}
            </Avatar>
            <Input
              value={userComment}
              onChange={(e) => setUserComment(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handleSaveComment();
                }
              }}
              placeholder="Write your comment"
              className="border border-gray-300 rounded-3xl px-4 py-2 w-full ml-2"
            />
          </div>
    
          {cardData.comments.length > 0 ? (
            <List
              dataSource={cardData.comments.slice().reverse()} // Display latest comment first
              renderItem={(comment, idx) => (
                <List.Item
                  key={comment._id}
                  className={`ml-2 text-gray-700 mt-2 ${
                    idx === 0 ? "bg-gray-100" : "bg-white"
                  }`}
                >
                  <List.Item.Meta
                    avatar={
                      <Avatar style={{ backgroundColor: "#1890ff" }}>
                        {comment.commentBy[0].toUpperCase()}
                      </Avatar>
                    }
                    title={<strong>{comment.commentBy}</strong>}
                    description={
                      <>
                        <div>{comment.comment}</div>
                        <div className="text-gray-500 text-sm">
                          {new Date(comment.createdAt).toLocaleString()}
                        </div>
                      </>
                    }
                  />
                </List.Item>
              )}
            />
          ) : (
            <Text>No comments yet.</Text>
          )}
        </div>
      ),
    }
    
  ];


  return (
    <div className="container mx-auto p-4">
    <div className="flex">
      {/* Left Column */}
      <div className="w-2/3 pr-4">
      <div className="mb-4">
        {isEditingTitle ? (
          <Input
            value={cardData.name}
            onChange={(e) => setCardData((prev) => ({ ...prev, name: e.target.value }))}
            onBlur={handleTitleBlur} // Update title on blur
            onPressEnter={handleTitleBlur} // Update title on Enter key press
            className="border-gray-300 rounded-xl px-4 py-2 mt-5 w-full"
            placeholder="Card Title"
            autoFocus
          />
        ) : (
          <Text
            onDoubleClick={() => setIsEditingTitle(true)}
            className="cursor-pointer"
          >
            {cardData.name || 'No Title'}
          </Text>
        )}
        {renameCardErrors.name && <Text type="danger">{renameCardErrors.name}</Text>}
      </div>
      <div className="mb-4">
  <Text className="text-gray-600">In column {cardData.taskName || 'No Task Name'}</Text>
</div>
      <div className="mb-4">
        {isEditingDescription ? (
          <>
            <TextArea
              value={cardData.description}
              onChange={(e) => setCardData((prev) => ({ ...prev, description: e.target.value }))}
              onBlur={handleDescriptionBlur} // Update description on blur
              className="border-gray-300 rounded-xl px-4 py-2 w-full"
              placeholder="Card Description"
              autoFocus
            />
            <div className="flex justify-end mt-4">
              <Button onClick={() => setIsEditingDescription(false)} className="mr-2">
                Cancel
              </Button>
              <Button onClick={handleRenameCardDescription} type="primary">
                Save
              </Button>
            </div>
          </>
        ) : (
          <Text
            onDoubleClick={() => setIsEditingDescription(true)}
            className="cursor-pointer"
          >
            {cardData.description || 'No Description'}
          </Text>
        )}
        {renameCardErrors.description && <Text type="danger">{renameCardErrors.description}</Text>}
      </div>

      <div className="mb-4">
        <Tabs defaultActiveKey="1" items={items} />
      </div>
    </div>
  
      {/* Right Column */}
      <div className="w-1/3 pl-4">
  <div className="mb-4">
    <Text strong>Project:</Text>
    <Text>{cardData.projectName || 'N/A'}</Text>
  </div>
  <div className="mb-4">
    <Text strong>Assigned To:</Text>
    <Text>{cardData.assignedTo || 'N/A'}</Text>
  </div>
  <div className="mb-4">
    <Text strong>Created By:</Text>
    <Text>{cardData.createdBy || 'N/A'}</Text>
  </div>
  <div className="mb-4">
    <Text strong>Due Date:</Text>
    <Text>
      {cardData.dueDate
        ? new Date(cardData.dueDate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            hour12: true,
          })
        : 'N/A'}
    </Text>
  </div>
  <div className="flex justify-between mt-6">
    <div className="w-full mt-20">
      <Text strong className="block mb-4 text-xl">Progress</Text>
      <div className="mb-4">
        <Text>Estimated Hours:</Text>
        <div className="flex items-center">
          <Tooltip title={`${cardData.estimatedHours || 0} hours`}>
            <Progress
              className="ml-2"
              percent={100} // Always 100% since it's the full estimate
              showInfo={false}
            />
          </Tooltip>
        </div>
      </div>
      <div className="mb-4">
        <Text>Utilized Hours:</Text>
        <div className="flex items-center">
          <Tooltip title={`${cardData.utilizedHours || 0} hours`}>
            <Progress
              className="ml-2"
              percent={(cardData.utilizedHours / cardData.estimatedHours) * 100 || 0}
              showInfo={false}
            />
          </Tooltip>
        </div>
      </div>
      <div className="mb-4">
        <Text>Remaining Hours:</Text>
        <div className="flex items-center">
          <Tooltip title={`${cardData.remainingHours || 0} hours`}>
            <Progress
              className="ml-2"
              percent={(cardData.remainingHours / cardData.estimatedHours) * 100 || 0}
              showInfo={false}
            />
          </Tooltip>
        </div>
      </div>
    </div>
  </div>
</div>

    </div>
  </div>
  
  );
};

export default RenameCardPage;
