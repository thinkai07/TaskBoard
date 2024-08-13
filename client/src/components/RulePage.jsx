// //rulespage.jsx
// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import { X, ChevronDown, ArrowRight, PlusCircle, Clock, CheckSquare, Trash2, ArrowLeft, } from "lucide-react";
// import { server } from "../constant";
// import { useParams } from "react-router-dom";
// import useTokenValidation from "./UseTockenValidation";

// const TriggerOption = ({ icon: Icon, label, isSelected, onClick }) => (
//   <button
//     className={`flex items-center space-x-2 p-2 hover:bg-gray-100 w-full text-left ${isSelected ? "bg-blue-100" : ""
//       }`}
//     onClick={onClick}
//   >
//     <Icon size={18} />
//     <span>{label}</span>
//   </button>
// );

// const ActionOption = ({ icon: Icon, label, onClick }) => (
//   <button
//     className="flex flex-col items-center justify-center p-2 hover:bg-gray-100 rounded"
//     onClick={onClick}
//   >
//     <Icon size={24} />
//     <span className="text-xs mt-1">{label}</span>
//   </button>
// );

// function RulesButton({tasks,}) {
//   useTokenValidation();
//   const [isOpen, setIsOpen] = useState(false);
//   const [showRulesUI, setShowRulesUI] = useState(false);
//   const [showTriggers, setShowTriggers] = useState(false);
//   const [selectedTrigger, setSelectedTrigger] = useState("");
//   const [triggerCondition, setTriggerCondition] = useState("");
//   const [listName, setListName] = useState("");
//   const [triggerAdded, setTriggerAdded] = useState(false);
//   const [actionStep, setActionStep] = useState(false);
//   const [actionAdded, setActionAdded] = useState(false);
//   const [currentStep, setCurrentStep] = useState(1);
//   const [selectedAction, setSelectedAction] = useState(null);
//   const [moveToList, setMoveToList] = useState("");
//   const [userEmail, setUserEmail] = useState("");
//   const [conditions, setConditions] = useState([]);
//   const [actions, setActions] = useState([]);
//   const [rules, setRules] = useState([]);
//   const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
//   const [ruleToDelete, setRuleToDelete] = useState(null);
//   const { projectId } = useParams();
//   const [boardData, setBoardData] = useState({ columns: [] });
//   const [cardStatuses, setCardStatuses] = useState([]);
//   const [createdByCondition, setCreatedByCondition] = useState("");

//   const openDeleteConfirmation = (ruleId) => {
//     setRuleToDelete(ruleId);
//     setShowDeleteConfirmation(true);
//   };

//   const closeDeleteConfirmation = () => {
//     setShowDeleteConfirmation(false);
//     setRuleToDelete(null);
//   };

//   useEffect(() => {
//     const fetchUserEmail = async () => {
//       try {
//         const response = await axios.get(`${server}/api/user`, {
//           headers: {
//             Authorization: `Bearer ${localStorage.getItem("token")}`,
//           },
//         });
//         setUserEmail(response.data.user.email);
//       } catch (error) {
//         console.error("Error fetching user data:", error);
//       }
//     };

//     fetchUserEmail();
//   }, []);

//   useEffect(() => {
//     const fetchRules = async () => {
//       try {
//         const response = await axios.get(`${server}/api/rules/${projectId}`, {
//           headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
//         });
//         setRules(response.data);
//         console.log(response.data);
//       } catch (error) {
//         console.error("Error fetching rules:", error);
//       }
//     };

//     if (projectId) {
//       fetchRules();
//     }
//   }, [projectId]);

//   const toggleDropdown = () => setIsOpen(!isOpen);

//   const openRulesUI = () => {
//     setIsOpen(false);
//     setShowRulesUI(true);
//   };

//   const handleAddTrigger = () => {
//     setShowTriggers(true);
//   };

//   const handleTriggerSelect = (trigger) => {
//     setSelectedTrigger(trigger);
//   };

//   const handleAddButtonClick = () => {
//     setTriggerAdded(true);
//     setActionStep(true);
//     setCurrentStep(2);
//   };

//   const handleAddActionClick = () => {
//     setActionAdded(true);
//     setCurrentStep(3);
//   };

//   const handleBack = () => {
//     if (currentStep === 2) {
//       setActionStep(false);
//       setTriggerAdded(false);
//       setCurrentStep(1);
//     } else if (currentStep === 3) {
//       setActionAdded(false);
//       setCurrentStep(2);
//     }
//   };

//   const handleActionSelect = (action) => {
//     setSelectedAction(action);
//   };

//   const handleSaveRule = async () => {
//     try {
//       let triggerSentence = "";
//       if (selectedTrigger === "Card Move") {
//         triggerSentence = `When card status is marked as ${triggerCondition}`;
//       } else if (selectedTrigger === "Card Changes") {
//         triggerSentence = `When card is moved to ${triggerCondition}`;
//       }

//       // Determine the actionSentence
//       let actionSentence = "";
//       if (selectedAction === "Move to List") {
//         actionSentence = `Move to column ${moveToList}`;
//       } else if (selectedAction === "Complete Task") {
//         actionSentence = `Mark the task as completed`;
//       } else if (selectedAction === "Delete Task") {
//         actionSentence = `Delete the task`;
//       } else if (selectedAction === "Assign Task") {
//         actionSentence = `Assign task to ${userEmail}`;
//       }

//       const newRule = {
//         name: `${selectedTrigger} Rule`,
//         trigger: selectedTrigger,
//         triggerCondition,
//         listName,
//         action: selectedAction,
//         actionDetails: { moveToList },
//         createdBy: userEmail,
//         projectId,
//         createdByCondition,
//         triggerSentence,
//         actionSentence, 
//       };

//       // Post the new rule to the server
//       const response = await axios.post(`${server}/api/rules`, newRule, {
//         headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
//       });

//       // Assuming the response contains the saved rule
//       const savedRule = response.data;

//       // Update the state to include the newly saved rule
//       setRules((prevRules) => [...prevRules, savedRule]);

//       // Reset the form fields
//       setCurrentStep(1);
//       setSelectedTrigger("");
//       setTriggerCondition("");
//       setCreatedByCondition("");
//       setShowTriggers(false);
//       setSelectedAction("");
//       setMoveToList("");
//       setUserEmail("");
//       setShowRulesUI(false);
//     } catch (error) {
//       console.error("Error saving rule:", error);
//     }
//   };

//   const confirmDelete = async () => {
//     if (ruleToDelete) {
//       try {
//         await axios.delete(`${server}/api/rules/${ruleToDelete}`, {
//           headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
//         });
//         setRules(rules.filter((rule) => rule._id !== ruleToDelete));
//         closeDeleteConfirmation();
//       } catch (error) {
//         console.error("Error deleting rule:", error);
//       }
//     }
//   };

//   useEffect(() => {
//     const fetchCardStatuses = async () => {
//       try {
//         const response = await axios.get(`${server}/api/card-statuses`, {
//           headers: {
//             Authorization: `Bearer ${localStorage.getItem("token")}`,
//           },
//         });
//         setCardStatuses(response.data.statuses);
//       } catch (error) {
//         console.error("Error fetching card statuses:", error);
//         setCardStatuses(["Completed", "Pending", "Inprogress"]); // Fallback to default statuses
//       }
//     };

//     fetchCardStatuses();
//   }, []);

//   return (
//     <div className="relative">
//       <button
//         onClick={toggleDropdown}
//         className="bg-purple-500 text-white px-4 py-2 rounded-full flex items-center"
//       >
//         Automation <ChevronDown className="ml-2" />
//       </button>
//       {isOpen && (
//         <div className="absolute top-full left-0 mt-2 w-40 bg-white rounded-md shadow-lg">
//           <button
//             onClick={openRulesUI}
//             className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
//           >
//             RULES
//           </button>
//         </div>
//       )}
//       {showRulesUI && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white p-6 rounded-lg w-2/3 max-h-[80vh] overflow-y-auto relative">
//             <button
//               className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
//               onClick={() => setShowRulesUI(false)}
//             >
//               <X size={20} />
//             </button>


//             <h2 className="text-2xl font-semibold mb-4">Create a Rule</h2>
//             <div className="flex items-center space-x-4 mb-4">
//               <div
//                 className={`rounded-full px-4 py-2 text-sm ${currentStep >= 1
//                   ? "bg-green-200 text-green-800"
//                   : "bg-gray-200"
//                   }`}
//               >
//                 1 Select trigger {currentStep > 1 && "✓"}
//               </div>
//               <div className="text-gray-400">&gt;</div>
//               <div
//                 className={`rounded-full px-4 py-2 text-sm ${currentStep >= 2 ? "bg-blue-200 text-blue-800" : "bg-gray-200"
//                   }`}
//               >
//                 2 Select action {currentStep > 2 && "✓"}
//               </div>
//               <div className="text-gray-400">&gt;</div>
//               <div
//                 className={`rounded-full px-4 py-2 text-sm ${currentStep === 3
//                   ? "bg-blue-200 text-blue-800"
//                   : "bg-gray-200"
//                   }`}
//               >
//                 3 Review and save
//               </div>
//             </div>
//             <div className="mb-4">
//               <h3 className="text-xl font-semibold mb-2">Existing Rules</h3>
//               {rules.length === 0 ? (
//                 <p>No rules have been configured yet.</p>
//               ) : (
//                 rules.map((rule, index) => (
//                   <div
//                     key={index}
//                     className="bg-gray-100 p-4 rounded-md mb-2 flex items-center justify-between"
//                   >
//                     <div className="flex items-center space-x-4">
//                       <p className="font-semibold">
//                         {rule.triggerSentence || "No trigger sentence"} -
//                       </p>
//                       <p>{rule.actionSentence || "No action sentence"}</p>
//                     </div>
//                     <button onClick={() => openDeleteConfirmation(rule._id)}>
//                       <Trash2 className="text-gray-400 hover:text-red-600" />
//                     </button>
//                   </div>
//                 ))
//               )}
//             </div>

//             {currentStep === 1 && (
//               <>
//                 <h3 className="text-xl font-semibold mb-2">Select Trigger</h3>
//                 {!showTriggers ? (
//                   <button
//                     className="w-full bg-blue-500 text-white py-2 rounded-md"
//                     onClick={handleAddTrigger}
//                   >
//                     + Add Trigger
//                   </button>
//                 ) : (
//                   <div className="relative">
//                     <div className="flex space-x-2 w-80 mb-4">
//                       <TriggerOption
//                         icon={ArrowRight}
//                         label="Card Move"
//                         isSelected={selectedTrigger === "Card Move"}
//                         onClick={() => handleTriggerSelect("Card Move")}
//                       />
//                       <TriggerOption
//                         icon={PlusCircle}
//                         label="Card Changes"
//                         isSelected={selectedTrigger === "Card Changes"}
//                         onClick={() => handleTriggerSelect("Card Changes")}
//                       />
//                     </div>
//                     <div className="bg-gray-100 p-4 rounded-md relative">
//                       {selectedTrigger === "Card Move" && (
//                         <>
//                           <div className="flex items-center space-x-2 mb-2">
//                             <span>when card status mark as</span>
//                             <select
//                               value={triggerCondition}
//                               onChange={(e) =>
//                                 setTriggerCondition(e.target.value)
//                               }
//                               className="border rounded px-2 py-1"
//                             >
//                               <option value="" disabled>
//                                 Select
//                               </option>
//                               {cardStatuses.map((status) => (
//                                 <option
//                                   key={status}
//                                   value={status.toLowerCase()}
//                                 >
//                                   {status}
//                                 </option>
//                               ))}
//                             </select>
//                             <select
//                               value={createdByCondition}
//                               onChange={(e) =>
//                                 setCreatedByCondition(e.target.value)
//                               }
//                               className="border rounded px-2 py-1"
//                             >
//                               <option value="" disabled>
//                                 Select
//                               </option>
//                               <option value="by me">by me</option>
//                               <option value="by anyone">by anyone</option>
//                               <option value="by anyone except me">
//                                 by anyone except me
//                               </option>
//                             </select>
//                           </div>
//                           <p className="text-sm text-gray-600">
//                             The rule will be triggered when a card is moved.
//                           </p>
//                         </>
//                       )}
//                     </div>
//                   </div>
//                 )}
//                 {showTriggers && (
//                   <div className="flex space-x-4 mt-4">
//                     <button
//                       className="bg-green-500 text-white py-2 px-4 rounded"
//                       onClick={handleAddButtonClick}
//                     >
//                       Add Trigger
//                     </button>
//                     <button
//                       className="bg-gray-300 text-gray-700 py-2 px-4 rounded"
//                       onClick={() => setShowTriggers(false)}
//                     >
//                       Back
//                     </button>
//                   </div>
//                 )}
//               </>
//             )}

//             {currentStep === 2 && (
//               <>
//                 <h3 className="text-xl font-semibold mb-2">Select Action</h3>
//                 <div className="grid grid-cols-4 gap-4">
//                   <ActionOption
//                     icon={Clock}
//                     label="Move to List"
//                     onClick={() => handleActionSelect("Move to List")}
//                   />
//                   <ActionOption
//                     icon={CheckSquare}
//                     label="Complete Task"
//                     onClick={() => handleActionSelect("Complete Task")}
//                   />
//                   <ActionOption
//                     icon={Trash2}
//                     label="Delete Task"
//                     onClick={() => handleActionSelect("Delete Task")}
//                   />
//                   <ActionOption
//                     icon={ArrowLeft}
//                     label="Assign Task"
//                     onClick={() => handleActionSelect("Assign Task")}
//                   />
//                 </div>
//                 {selectedAction && (
//                   <div className="bg-gray-100 p-4 rounded-md mt-4">
//                     {selectedAction === "Move to List" && (
//                       <>
//                         <h4 className="font-semibold mb-2">
//                           Move to column 
//                         </h4>
//                         <select
//                           className="border rounded w-full px-2 py-1 mb-2"
//                           value={moveToList}
//                           onChange={(e) => setMoveToList(e.target.value)}
//                         >
//                           <option value="">Select a column</option>
//                           {tasks.map((task) => (
//                             <option key={task.id} value={task.name}>
//                               {task.name}
//                             </option>
//                           ))}
//                         </select>

//                         <p className="text-sm text-gray-600">
//                           The card will be moved to the specified column.
//                         </p>
//                       </>
//                     )}
//                     {selectedAction === "Complete Task" && (
//                       <p className="text-sm text-gray-600">
//                         The selected task will be marked as complete.
//                       </p>
//                     )}
//                     {selectedAction === "Delete Task" && (
//                       <p className="text-sm text-gray-600">
//                         The selected task will be deleted.
//                       </p>
//                     )}
//                     {selectedAction === "Assign Task" && (
//                       <>
//                         <h4 className="font-semibold mb-2">
//                           Assign Task Details
//                         </h4>
//                         <input
//                           type="text"
//                           className="border rounded w-full px-2 py-1 mb-2"
//                           placeholder="Enter User Email"
//                           value={userEmail}
//                           onChange={(e) => setUserEmail(e.target.value)}
//                         />
//                         <p className="text-sm text-gray-600">
//                           The selected task will be assigned to the specified
//                           user.
//                         </p>
//                       </>
//                     )}
//                   </div>
//                 )}
//                 <button
//                   className="bg-green-500 text-white py-2 px-4 rounded mt-4"
//                   onClick={handleAddActionClick}
//                 >
//                   Add Action
//                 </button>
//                 <button
//                   className="bg-gray-500 text-white py-2 px-4 rounded mt-4 ml-2"
//                   onClick={handleBack}
//                 >
//                   Back
//                 </button>
//               </>
//             )}

//             {currentStep === 3 && (
//               <>
//                 <h3 className="text-xl font-semibold mb-2">Review and Save</h3>
//                 <div className="bg-gray-100 p-4 rounded-md mb-4">
//                   <h4 className="font-semibold mb-2">Trigger</h4>
//                   <p>
//                     {selectedTrigger === "Card Move" && (
//                       <>
//                         When card status is marked as{" "}
//                         <strong>{triggerCondition}</strong>
//                       </>
//                     )}
//                     {selectedTrigger === "Card Changes" && (
//                       <>
//                         When card is moved to{" "}
//                         <strong>{triggerCondition}</strong>
//                       </>
//                     )}
//                   </p>
//                   <h4 className="font-semibold mt-4 mb-2">Action</h4>
//                   <p>
//                     {selectedAction === "Move to List" && (
//                       <>
//                         Move to column <strong>{moveToList}</strong>
//                       </>
//                     )}
//                     {selectedAction === "Complete Task" && (
//                       <>Mark the task as completed</>
//                     )}
//                     {selectedAction === "Delete Task" && <>Delete the task</>}
//                     {selectedAction === "Assign Task" && (
//                       <>
//                         Assign task to <strong>{userEmail}</strong>
//                       </>
//                     )}
//                   </p>
//                 </div>

//                 <button
//                   className="bg-blue-500 text-white py-2 px-4 rounded"
//                   onClick={handleSaveRule}
//                 >
//                   Save Rule
//                 </button>
//                 <button
//                   className="bg-gray-500 text-white py-2 px-4 rounded ml-2"
//                   onClick={() => setCurrentStep(2)}
//                 >
//                   Back
//                 </button>
//               </>
//             )}

//             {showDeleteConfirmation && (
//               <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//                 <div className="bg-white p-6 rounded-lg w-1/3">
//                   <h3 className="text-xl font-semibold mb-4">Confirm Deletion</h3>
//                   <p className="mb-6">Are you sure you want to delete this rule?</p>
//                   <div className="flex justify-end space-x-4">
//                     <button
//                       className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
//                       onClick={closeDeleteConfirmation}
//                     >
//                       Cancel
//                     </button>
//                     <button
//                       className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
//                       onClick={confirmDelete}
//                     >
//                       Delete
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
// export default RulesButton;

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import useTokenValidation from "./UseTockenValidation";
import { Button, Modal, Select, Steps, Card, Input, List, Popconfirm, message} from "antd";
import { 
  ArrowRightOutlined, 
  PlusCircleOutlined, 
  ClockCircleOutlined, 
  CheckSquareOutlined, 
  DeleteOutlined, 
  UserOutlined 
} from "@ant-design/icons";
import { server } from "../constant";

const { Step } = Steps;
const { Option } = Select;

function RulesButton({ tasks }) {
  useTokenValidation();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedTrigger, setSelectedTrigger] = useState("");
  const [triggerCondition, setTriggerCondition] = useState("");
  const [createdByCondition, setCreatedByCondition] = useState("");
  const [selectedAction, setSelectedAction] = useState("");
  const [moveToList, setMoveToList] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [rules, setRules] = useState([]);
  const [cardStatuses, setCardStatuses] = useState([]);
  const { projectId } = useParams();

  useEffect(() => {
    fetchUserEmail();
    fetchRules();
    fetchCardStatuses();
  }, [projectId]);

  const fetchUserEmail = async () => {
    try {
      const response = await axios.get(`${server}/api/user`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setUserEmail(response.data.user.email);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const fetchRules = async () => {
    try {
      const response = await axios.get(`${server}/api/rules/${projectId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setRules(response.data);
    } catch (error) {
      console.error("Error fetching rules:", error);
    }
  };

  const fetchCardStatuses = async () => {
    try {
      const response = await axios.get(`${server}/api/card-statuses`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setCardStatuses(response.data.statuses);
    } catch (error) {
      console.error("Error fetching card statuses:", error);
      setCardStatuses(["Completed", "Pending", "Inprogress"]);
    }
  };

  const showModal = () => setIsModalVisible(true);
  const handleCancel = () => {
    setIsModalVisible(false);
    resetForm();
  };

  const resetForm = () => {
    setCurrentStep(0);
    setSelectedTrigger("");
    setTriggerCondition("");
    setCreatedByCondition("");
    setSelectedAction("");
    setMoveToList("");
  };

  const handleSaveRule = async () => {
    try {
      const triggerSentence = `When card status is marked as ${triggerCondition}`;
      let actionSentence = "";
      
      switch (selectedAction) {
        case "Move to List":
          actionSentence = `Move to column ${moveToList}`;
          break;
        case "Complete Task":
          actionSentence = "Mark the task as completed";
          break;
        case "Delete Task":
          actionSentence = "Delete the task";
          break;
        case "Assign Task":
          actionSentence = `Assign task to ${userEmail}`;
          break;
      }

      const newRule = {
        name: `${selectedTrigger} Rule`,
        trigger: selectedTrigger,
        triggerCondition,
        action: selectedAction,
        actionDetails: { moveToList },
        createdBy: userEmail,
        projectId,
        createdByCondition,
        triggerSentence,
        actionSentence,
      };

      const response = await axios.post(`${server}/api/rules`, newRule, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      setRules((prevRules) => [...prevRules, response.data]);
      message.success("Rule created successfully");
      handleCancel();
    } catch (error) {
      console.error("Error saving rule:", error);
      message.error("Failed to create rule");
    }
  };

  const handleDeleteRule = async (ruleId) => {
    try {
      await axios.delete(`${server}/api/rules/${ruleId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setRules(rules.filter((rule) => rule._id !== ruleId));
      message.success("Rule deleted successfully");
    } catch (error) {
      console.error("Error deleting rule:", error);
      message.error("Failed to delete rule");
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <Card title="Select Trigger">
            <Select
              style={{ width: "100%" }}
              placeholder="Select a trigger"
              onChange={(value) => setSelectedTrigger(value)}
            >
              <Option value="Card Move">
                <ArrowRightOutlined /> Card Move
              </Option>
              <Option value="Card Changes">
                <PlusCircleOutlined /> Card Changes
              </Option>
            </Select>
            {selectedTrigger && (
              <div style={{ marginTop: 16 }}>
                <Select
                  style={{ width: "100%", marginBottom: 8 }}
                  placeholder="Select card status"
                  onChange={(value) => setTriggerCondition(value)}
                >
                  {cardStatuses.map((status) => (
                    <Option key={status} value={status.toLowerCase()}>
                      {status}
                    </Option>
                  ))}
                </Select>
                <Select
                  style={{ width: "100%" }}
                  placeholder="Select created by condition"
                  onChange={(value) => setCreatedByCondition(value)}
                >
                  <Option value="by me">by me</Option>
                  <Option value="by anyone">by anyone</Option>
                  <Option value="by anyone except me">by anyone except me</Option>
                </Select>
              </div>
            )}
          </Card>
        );
      case 1:
        return (
          <Card title="Select Action">
            <Select
              style={{ width: "100%" }}
              placeholder="Select an action"
              onChange={(value) => setSelectedAction(value)}
            >
              <Option value="Move to List">
                <ClockCircleOutlined /> Move to List
              </Option>
              <Option value="Complete Task">
                <CheckSquareOutlined /> Complete Task
              </Option>
              <Option value="Delete Task">
                <DeleteOutlined /> Delete Task
              </Option>
              <Option value="Assign Task">
                <UserOutlined /> Assign Task
              </Option>
            </Select>
            {selectedAction === "Move to List" && (
              <Select
                style={{ width: "100%", marginTop: 16 }}
                placeholder="Select a column"
                onChange={(value) => setMoveToList(value)}
              >
                {tasks.map((task) => (
                  <Option key={task.id} value={task.name}>
                    {task.name}
                  </Option>
                ))}
              </Select>
            )}
            {selectedAction === "Assign Task" && (
              <Input
                style={{ marginTop: 16 }}
                placeholder="Enter User Email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
              />
            )}
          </Card>
        );
      case 2:
        return (
          <Card title="Review and Save">
            <p><strong>Trigger:</strong> {selectedTrigger} - {triggerCondition}</p>
            <p><strong>Action:</strong> {selectedAction} {moveToList && `- ${moveToList}`}</p>
          </Card>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Button onClick={showModal} type="primary">
        Automation
      </Button>
      <Modal
        title="Rules Management"
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={800}
      >
        <Steps current={currentStep}>
          <Step title="Select Trigger" />
          <Step title="Select Action" />
          <Step title="Review and Save" />
        </Steps>
        <div style={{ marginTop: 24 }}>{renderStepContent()}</div>
        <div style={{ marginTop: 24 }}>
          <Button
            style={{ marginRight: 8 }}
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
          >
            Previous
          </Button>
          {currentStep < 2 ? (
            <Button
              type="primary"
              onClick={() => setCurrentStep(Math.min(2, currentStep + 1))}
            >
              Next
            </Button>
          ) : (
            <Button type="primary" onClick={handleSaveRule}>
              Save Rule
            </Button>
          )}
        </div>
        <List
          style={{ marginTop: 24 }}
          header={<div>Existing Rules</div>}
          bordered
          dataSource={rules}
          renderItem={(rule) => (
            <List.Item
              actions={[
                <Popconfirm
                  title="Are you sure you want to delete this rule?"
                  onConfirm={() => handleDeleteRule(rule._id)}
                  okText="Yes"
                  cancelText="No"
                >
                  <Button icon={<DeleteOutlined />} />
                </Popconfirm>
              ]}
            >
              <List.Item.Meta
                title={rule.name}
                description={`${rule.triggerSentence} - ${rule.actionSentence}`}
              />
            </List.Item>
          )}
        />
      </Modal>
    </>
  );
}
export default RulesButton;