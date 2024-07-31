//rulespage.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  ChevronDown,
  ArrowRight,
  PlusCircle,
  Clock,
  CheckSquare,
  Trash2,
  ArrowLeft,
} from "lucide-react";
import { server } from "../constant";
import { useParams } from "react-router-dom";

const TriggerOption = ({ icon: Icon, label, isSelected, onClick }) => (
  <button
    className={`flex items-center space-x-2 p-2 hover:bg-gray-100 w-full text-left ${
      isSelected ? "bg-blue-100" : ""
    }`}
    onClick={onClick}
  >
    <Icon size={18} />
    <span>{label}</span>
  </button>
);

const ActionOption = ({ icon: Icon, label, onClick }) => (
  <button
    className="flex flex-col items-center justify-center p-2 hover:bg-gray-100 rounded"
    onClick={onClick}
  >
    <Icon size={24} />
    <span className="text-xs mt-1">{label}</span>
  </button>
);

function RulesButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [showRulesUI, setShowRulesUI] = useState(false);
  const [showTriggers, setShowTriggers] = useState(false);
  const [selectedTrigger, setSelectedTrigger] = useState("");
  const [triggerCondition, setTriggerCondition] = useState("");
  const [listName, setListName] = useState("");
  const [triggerAdded, setTriggerAdded] = useState(false);
  const [actionStep, setActionStep] = useState(false);
  const [actionAdded, setActionAdded] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedAction, setSelectedAction] = useState(null);
  const [moveToList, setMoveToList] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [conditions, setConditions] = useState([]);
  const [actions, setActions] = useState([]);
  const [rules, setRules] = useState([]);
  const { projectId } = useParams();
  const [boardData, setBoardData] = useState({ columns: [] });
  const [cardStatuses, setCardStatuses] = useState([]);

  const [tasks, setTasks] = useState([]);
  const [createdByCondition, setCreatedByCondition] = useState("");

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await axios.get(
          `${server}/api/projects/${projectId}/tasks`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setTasks(response.data.tasks);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };

    fetchTasks();
  }, [projectId]);

  useEffect(() => {
    const fetchUserEmail = async () => {
      try {
        const response = await axios.get(`${server}/api/user`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setUserEmail(response.data.user.email);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserEmail();
  }, []);

  useEffect(() => {
    const fetchRules = async () => {
      try {
        const response = await axios.get(`${server}/api/rules/${projectId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setRules(response.data);
        console.log(response.data);
      } catch (error) {
        console.error("Error fetching rules:", error);
      }
    };

    if (projectId) {
      fetchRules();
    }
  }, [projectId]);

  // Update fetchTasks function to include cards
  async function fetchTasks() {
    try {
      const response = await fetch(
        `${server}/api/projects/${projectId}/tasks`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error("Failed to fetch tasks");
      }
      const { tasks } = await response.json();

      const columns = await Promise.all(
        tasks.map(async (task) => {
          const cardsResponse = await fetch(
            `${server}/api/tasks/${task.id}/cards`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );
          const { cards } = await cardsResponse.json();
          console.log(cards);
          return {
            id: task.id,
            title: task.name,
            cards: cards.map((card) => ({
              id: card.id,
              title: card.name || "",
              description: card.description || "",
              columnId: task.id,
              assignedTo: card.assignedTo,
              status: card.status,
              assignDate: card.assignDate,
              dueDate: card.dueDate,
              comments: card.comments || [],
            })),
          };
        })
      );

      setBoardData({ columns });
      console.log(columns);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  }

  const toggleDropdown = () => setIsOpen(!isOpen);

  const openRulesUI = () => {
    setIsOpen(false);
    setShowRulesUI(true);
  };

  const handleAddTrigger = () => {
    setShowTriggers(true);
  };

  const handleTriggerSelect = (trigger) => {
    setSelectedTrigger(trigger);
  };

  const handleAddButtonClick = () => {
    setTriggerAdded(true);
    setActionStep(true);
    setCurrentStep(2);
  };

  const handleAddActionClick = () => {
    setActionAdded(true);
    setCurrentStep(3);
  };

  const handleBack = () => {
    if (currentStep === 2) {
      setActionStep(false);
      setTriggerAdded(false);
      setCurrentStep(1);
    } else if (currentStep === 3) {
      setActionAdded(false);
      setCurrentStep(2);
    }
  };

  const handleActionSelect = (action) => {
    setSelectedAction(action);
  };

  const handleSaveRule = async () => {
    try {
      let triggerSentence = "";
      if (selectedTrigger === "Card Move") {
        triggerSentence = `When card status is marked as ${triggerCondition}`;
      } else if (selectedTrigger === "Card Changes") {
        triggerSentence = `When card is moved to ${triggerCondition}`;
      }

      // Determine the actionSentence
      let actionSentence = "";
      if (selectedAction === "Move to List") {
        actionSentence = `Move to list ${moveToList}`;
      } else if (selectedAction === "Complete Task") {
        actionSentence = `Mark the task as completed`;
      } else if (selectedAction === "Delete Task") {
        actionSentence = `Delete the task`;
      } else if (selectedAction === "Assign Task") {
        actionSentence = `Assign task to ${userEmail}`;
      }

      const newRule = {
        name: `${selectedTrigger} Rule`,
        trigger: selectedTrigger,
        triggerCondition,
        listName,
        action: selectedAction,
        actionDetails: { moveToList },
        createdBy: userEmail,
        projectId,
        createdByCondition,
        triggerSentence, // Add triggerSentence here
        actionSentence, // Add actionSentence here
      };

      // Post the new rule to the server
      const response = await axios.post(`${server}/api/rules`, newRule, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      // Assuming the response contains the saved rule
      const savedRule = response.data;

      // Update the state to include the newly saved rule
      setRules((prevRules) => [...prevRules, savedRule]);

      // Reset the form fields
      setCurrentStep(1);
      setSelectedTrigger("");
      setTriggerCondition("");
      setCreatedByCondition("");
      setShowTriggers(false);
      setSelectedAction("");
      setMoveToList("");
      setUserEmail("");
      setShowRulesUI(false);
    } catch (error) {
      console.error("Error saving rule:", error);
    }
  };

  const handleDeleteRule = async (ruleId) => {
    try {
      await axios.delete(`${server}/api/rules/${ruleId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setRules(rules.filter((rule) => rule._id !== ruleId));
    } catch (error) {
      console.error("Error deleting rule:", error);
    }
  };

  useEffect(() => {
    const fetchCardStatuses = async () => {
      try {
        const response = await axios.get(`${server}/api/card-statuses`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setCardStatuses(response.data.statuses);
      } catch (error) {
        console.error("Error fetching card statuses:", error);
        setCardStatuses(["Completed", "Pending", "Inprogress"]); // Fallback to default statuses
      }
    };

    fetchCardStatuses();
  }, []);

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="bg-purple-500 text-white px-4 py-2 rounded-full flex items-center"
      >
        Rules <ChevronDown className="ml-2" />
      </button>
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-40 bg-white rounded-md shadow-lg">
          <button
            onClick={openRulesUI}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            RULES
          </button>
        </div>
      )}
      {showRulesUI && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-2/3 max-h-[80vh] overflow-y-auto relative">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              onClick={() => setShowRulesUI(false)}
            >
              x
            </button>
            <h2 className="text-2xl font-bold mb-4">Create a Rule</h2>
            <div className="flex items-center space-x-4 mb-4">
              <div
                className={`rounded-full px-4 py-2 text-sm ${
                  currentStep >= 1
                    ? "bg-green-200 text-green-800"
                    : "bg-gray-200"
                }`}
              >
                1 Select trigger {currentStep > 1 && "✓"}
              </div>
              <div className="text-gray-400">&gt;</div>
              <div
                className={`rounded-full px-4 py-2 text-sm ${
                  currentStep >= 2 ? "bg-blue-200 text-blue-800" : "bg-gray-200"
                }`}
              >
                2 Select action {currentStep > 2 && "✓"}
              </div>
              <div className="text-gray-400">&gt;</div>
              <div
                className={`rounded-full px-4 py-2 text-sm ${
                  currentStep === 3
                    ? "bg-blue-200 text-blue-800"
                    : "bg-gray-200"
                }`}
              >
                3 Review and save
              </div>
            </div>
            <div className="mb-4">
              <h3 className="text-xl font-semibold mb-2">Existing Rules</h3>
              {rules.length === 0 ? (
                <p>No rules have been configured yet.</p>
              ) : (
                rules.map((rule, index) => (
                  <div
                    key={index}
                    className="bg-gray-100 p-4 rounded-md mb-2 flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-4">
                      <p className="font-semibold">
                        {rule.triggerSentence
                          ? rule.triggerSentence
                          : "No trigger sentence"}{" "}
                        -
                      </p>{" "}
                      <p>
                        {rule.actionSentence
                          ? rule.actionSentence
                          : "No action sentence"}
                      </p>
                      {/* {rule.actionDetails && (
                        <div className="flex items-center space-x-2">
                          {Object.entries(rule.actionDetails).map(
                            ([key, value], index) => (
                              <React.Fragment key={key}>
                                <span>
                                  {key} {value}
                                </span>
                                {index <
                                  Object.entries(rule.actionDetails).length -
                                    1 && <span>, </span>}
                              </React.Fragment>
                            )
                          )}
                        </div>
                      )} */}
                    </div>
                    <button onClick={() => handleDeleteRule(rule._id)}>
                      <Trash2 className="text-gray-400 hover:text-red-600" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {currentStep === 1 && (
              <>
                <h3 className="text-xl font-semibold mb-2">Select Trigger</h3>
                {!showTriggers ? (
                  <button
                    className="w-full bg-blue-500 text-white py-2 rounded-md"
                    onClick={handleAddTrigger}
                  >
                    + Add Trigger
                  </button>
                ) : (
                  <div className="relative">
                    <div className="flex space-x-2 w-80 mb-4">
                      <TriggerOption
                        icon={ArrowRight}
                        label="Card Move"
                        isSelected={selectedTrigger === "Card Move"}
                        onClick={() => handleTriggerSelect("Card Move")}
                      />
                      <TriggerOption
                        icon={PlusCircle}
                        label="Card Changes"
                        isSelected={selectedTrigger === "Card Changes"}
                        onClick={() => handleTriggerSelect("Card Changes")}
                      />
                    </div>
                    <div className="bg-gray-100 p-4 rounded-md relative">
                      {selectedTrigger === "Card Move" && (
                        <>
                          <div className="flex items-center space-x-2 mb-2">
                            <span>when card status mark as</span>
                            <select
                              value={triggerCondition}
                              onChange={(e) =>
                                setTriggerCondition(e.target.value)
                              }
                              className="border rounded px-2 py-1"
                            >
                              <option value="" disabled>
                                Select
                              </option>
                              {cardStatuses.map((status) => (
                                <option
                                  key={status}
                                  value={status.toLowerCase()}
                                >
                                  {status}
                                </option>
                              ))}
                            </select>
                            <select
                              value={createdByCondition}
                              onChange={(e) =>
                                setCreatedByCondition(e.target.value)
                              }
                              className="border rounded px-2 py-1"
                            >
                              <option value="" disabled>
                                Select
                              </option>
                              <option value="by me">by me</option>
                              <option value="by anyone">by anyone</option>
                              <option value="by anyone except me">
                                by anyone except me
                              </option>
                            </select>
                          </div>
                          <p className="text-sm text-gray-600">
                            The rule will be triggered when a card is moved.
                          </p>
                        </>
                      )}
                    </div>
                    <button
                      className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                      onClick={() => setShowTriggers(false)}
                    >
                      x
                    </button>
                  </div>
                )}
                <button
                  className="bg-green-500 text-white py-2 px-4 rounded mt-4"
                  onClick={handleAddButtonClick}
                >
                  Add Trigger
                </button>
              </>
            )}

            {currentStep === 2 && (
              <>
                <h3 className="text-xl font-semibold mb-2">Select Action</h3>
                <div className="grid grid-cols-4 gap-4">
                  <ActionOption
                    icon={Clock}
                    label="Move to List"
                    onClick={() => handleActionSelect("Move to List")}
                  />
                  <ActionOption
                    icon={CheckSquare}
                    label="Complete Task"
                    onClick={() => handleActionSelect("Complete Task")}
                  />
                  <ActionOption
                    icon={Trash2}
                    label="Delete Task"
                    onClick={() => handleActionSelect("Delete Task")}
                  />
                  <ActionOption
                    icon={ArrowLeft}
                    label="Assign Task"
                    onClick={() => handleActionSelect("Assign Task")}
                  />
                </div>
                {selectedAction && (
                  <div className="bg-gray-100 p-4 rounded-md mt-4">
                    {selectedAction === "Move to List" && (
                      <>
                        <h4 className="font-semibold mb-2">
                          Move to List Details
                        </h4>
                        <select
                          className="border rounded w-full px-2 py-1 mb-2"
                          value={moveToList}
                          onChange={(e) => setMoveToList(e.target.value)}
                        >
                          <option value="">Select a list</option>
                          {tasks.map((task) => (
                            <option key={task.id} value={task.name}>
                              {task.name}
                            </option>
                          ))}
                        </select>

                        <p className="text-sm text-gray-600">
                          The card will be moved to the specified list.
                        </p>
                      </>
                    )}
                    {selectedAction === "Complete Task" && (
                      <p className="text-sm text-gray-600">
                        The selected task will be marked as complete.
                      </p>
                    )}
                    {selectedAction === "Delete Task" && (
                      <p className="text-sm text-gray-600">
                        The selected task will be deleted.
                      </p>
                    )}
                    {selectedAction === "Assign Task" && (
                      <>
                        <h4 className="font-semibold mb-2">
                          Assign Task Details
                        </h4>
                        <input
                          type="text"
                          className="border rounded w-full px-2 py-1 mb-2"
                          placeholder="Enter User Email"
                          value={userEmail}
                          onChange={(e) => setUserEmail(e.target.value)}
                        />
                        <p className="text-sm text-gray-600">
                          The selected task will be assigned to the specified
                          user.
                        </p>
                      </>
                    )}
                  </div>
                )}
                <button
                  className="bg-green-500 text-white py-2 px-4 rounded mt-4"
                  onClick={handleAddActionClick}
                >
                  Add Action
                </button>
                <button
                  className="bg-gray-500 text-white py-2 px-4 rounded mt-4 ml-2"
                  onClick={handleBack}
                >
                  Back
                </button>
              </>
            )}

            {currentStep === 3 && (
              <>
                <h3 className="text-xl font-semibold mb-2">Review and Save</h3>
                <div className="bg-gray-100 p-4 rounded-md mb-4">
                  <h4 className="font-semibold mb-2">Trigger</h4>
                  <p>
                    {selectedTrigger === "Card Move" && (
                      <>
                        When card status is marked as{" "}
                        <strong>{triggerCondition}</strong>
                      </>
                    )}
                    {selectedTrigger === "Card Changes" && (
                      <>
                        When card is moved to{" "}
                        <strong>{triggerCondition}</strong>
                      </>
                    )}
                  </p>
                  <h4 className="font-semibold mt-4 mb-2">Action</h4>
                  <p>
                    {selectedAction === "Move to List" && (
                      <>
                        Move to list <strong>{moveToList}</strong>
                      </>
                    )}
                    {selectedAction === "Complete Task" && (
                      <>Mark the task as completed</>
                    )}
                    {selectedAction === "Delete Task" && <>Delete the task</>}
                    {selectedAction === "Assign Task" && (
                      <>
                        Assign task to <strong>{userEmail}</strong>
                      </>
                    )}
                  </p>
                </div>
                <button
                  className="bg-blue-500 text-white py-2 px-4 rounded"
                  onClick={handleSaveRule}
                >
                  Save Rule
                </button>
                <button
                  className="bg-gray-500 text-white py-2 px-4 rounded ml-2"
                  onClick={() => setCurrentStep(2)}
                >
                  Back
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default RulesButton;
