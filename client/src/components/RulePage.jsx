// // //rulespage.jsx with antd
import React, { useState, useEffect } from "react";
import axios from "axios";
import { ArrowRightOutlined, PlusCircleOutlined, ClockCircleOutlined, CheckSquareOutlined, DeleteOutlined, ArrowLeftOutlined,ToolOutlined } from "@ant-design/icons";
import { Button, Select, Input, Modal, Card, Steps, Typography, Space, Dropdown, Menu } from "antd";
import { server } from "../constant";
import { useParams } from "react-router-dom";
import useTokenValidation from "./UseTockenValidation";

const { Option } = Select;
const { Step } = Steps;
const { Title, Text } = Typography;

const TriggerOption = ({ icon: Icon, label, isSelected, onClick }) => (
  <Button
    icon={<Icon />}
    className={`flex items-center justify-start w-full ${isSelected ? "ant-btn-primary" : ""}`}
    onClick={onClick}
  >
    {label}
  </Button>
);

const ActionOption = ({ icon: Icon, label, onClick }) => (
  <Button
    icon={<Icon />}
    onClick={onClick}
    className="flex flex-col items-center justify-center h-24 w-24"
  >
    <Text className="mt-2">{label}</Text>
  </Button>
);

function RulesButton({ tasks }) {
  useTokenValidation();
  const [isOpen, setIsOpen] = useState(false);
  const [showRulesUI, setShowRulesUI] = useState(false);
  const [showTriggers, setShowTriggers] = useState(false);
  const [selectedTrigger, setSelectedTrigger] = useState("");
  const [triggerCondition, setTriggerCondition] = useState("");
  const [listName, setListName] = useState("");
  const [triggerAdded, setTriggerAdded] = useState(false);
  const [actionStep, setActionStep] = useState(false);
  const [actionAdded, setActionAdded] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedAction, setSelectedAction] = useState(null);
  const [moveToList, setMoveToList] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [rules, setRules] = useState([]);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [ruleToDelete, setRuleToDelete] = useState(null);
  const { projectId } = useParams();
  const [cardStatuses, setCardStatuses] = useState([]);
  const [createdByCondition, setCreatedByCondition] = useState("");

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
      } catch (error) {
        console.error("Error fetching rules:", error);
      }
    };

        if (projectId) {
            fetchRules();
        }
    }, [projectId]);

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
        setCardStatuses(["Completed", "Pending", "Inprogress"]);
      }
    };

    fetchCardStatuses();
  }, []);

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
    setCurrentStep(1);
  };

  const handleAddActionClick = () => {
    setActionAdded(true);
    setCurrentStep(2);
  };

  const handleBack = () => {
    if (currentStep === 1) {
      setActionStep(false);
      setTriggerAdded(false);
      setCurrentStep(0);
    } else if (currentStep === 2) {
      setActionAdded(false);
      setCurrentStep(1);
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

      let actionSentence = "";
      if (selectedAction === "Move to List") {
        actionSentence = `Move to column ${moveToList}`;
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
        triggerSentence,
        actionSentence,
      };

      const response = await axios.post(`${server}/api/rules`, newRule, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      const savedRule = response.data;
      setRules((prevRules) => [...prevRules, savedRule]);

      setCurrentStep(0);
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

  const openDeleteConfirmation = (ruleId) => {
    setRuleToDelete(ruleId);
    setShowDeleteConfirmation(true);
  };

  const closeDeleteConfirmation = () => {
    setShowDeleteConfirmation(false);
    setRuleToDelete(null);
  };

    const confirmDelete = async () => {
        if (ruleToDelete) {
            try {
                await axios.delete(`${server}/api/rules/${ruleToDelete}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                });
                setRules(rules.filter((rule) => rule._id !== ruleToDelete));
                closeDeleteConfirmation();
            } catch (error) {
                console.error("Error deleting rule:", error);
            }
        }
    };

  const menu = (
    <Menu>
      <Menu.Item key="1" onClick={openRulesUI}>
        RULES
      </Menu.Item>
    </Menu>
  );
  return (
    <div className="relative">
      {/* <Dropdown overlay={menu} trigger={['click']}>
        <Button type="primary" shape="round">
          Rules<ArrowRightOutlined />
        </Button>
      </Dropdown> */}
      <Dropdown overlay={menu} trigger={['click']}>
      <Button
      type="default"

      icon={<ToolOutlined />}
    >
      Automation
    </Button>
      </Dropdown>

      <Modal
        visible={showRulesUI}
        onCancel={() => setShowRulesUI(false)}
        footer={null}
        width="70%"
      >
        <Title level={2}>Create a Rule</Title>
        <Steps current={currentStep} className="mb-6">
          <Step title="Select trigger" />
          <Step title="Select action" />
          <Step title="Review and save" />
        </Steps>

        <Card title="Existing Rules" className="mb-6" style={{ maxHeight: '200px', overflowY: 'auto' }}>
          {rules.length === 0 ? (
            <Text>No rules have been configured yet.</Text>
          ) : (
            rules.map((rule, index) => (
              <Card.Grid key={index} className="w-full">
                <Space>
                  <Text strong>{rule.triggerSentence || "No trigger sentence"} -</Text>
                  <Text>{rule.actionSentence || "No action sentence"}</Text>
                  <Button
                    icon={<DeleteOutlined />}
                    onClick={() => openDeleteConfirmation(rule._id)}
                    type="text"
                    danger
                  />
                </Space>
              </Card.Grid>
            ))
          )}
        </Card>
        {currentStep === 0 && (
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            <Title level={3}>Select Trigger</Title>
            {!showTriggers ? (
              <Button type="primary" block onClick={handleAddTrigger}>
                + Add Trigger
              </Button>
            ) : (
              <Space direction="vertical" className="w-full">
                <Space>
                  <TriggerOption
                    icon={ArrowRightOutlined}
                    label="Card Move"
                    isSelected={selectedTrigger === "Card Move"}
                    onClick={() => handleTriggerSelect("Card Move")}
                  />
                  <TriggerOption
                    icon={PlusCircleOutlined}
                    label="Card Changes"
                    isSelected={selectedTrigger === "Card Changes"}
                    onClick={() => handleTriggerSelect("Card Changes")}
                  />
                </Space>
                <Card size="small">
                  {selectedTrigger === "Card Move" && (
                    <Space direction="vertical" size="small">
                      <Space>
                        <Text>when card status mark as</Text>
                        <Select
                          value={triggerCondition}
                          onChange={setTriggerCondition}
                          style={{ width: 120 }}
                        >
                          {cardStatuses.map((status) => (
                            <Option key={status} value={status.toLowerCase()}>
                              {status}
                            </Option>
                          ))}
                        </Select>
                        <Select
                          value={createdByCondition}
                          onChange={setCreatedByCondition}
                          style={{ width: 180 }}
                        >
                          <Option value="by me">by me</Option>
                          <Option value="by anyone">by anyone</Option>
                          <Option value="by anyone except me">by anyone except me</Option>
                        </Select>
                      </Space>
                      <Text type="secondary">
                        The rule will be triggered when a card is moved.
                      </Text>
                    </Space>
                  )}
                </Card>
                <Space>
                  <Button type="primary" onClick={handleAddButtonClick}>
                    Add Trigger
                  </Button>
                  <Button onClick={() => setShowTriggers(false)}>
                    Back
                  </Button>
                </Space>
              </Space>
            )}
          </div>
        )}
        {currentStep === 1 && (
          <>
            <Title level={3}>Select Action</Title>
            <Space size="large" wrap>
              <ActionOption
                icon={ClockCircleOutlined}
                label="Move to List"
                onClick={() => handleActionSelect("Move to List")}
              />
              <ActionOption
                icon={CheckSquareOutlined}
                label="Complete Task"
                onClick={() => handleActionSelect("Complete Task")}
              />
              <ActionOption
                icon={DeleteOutlined}
                label="Delete Task"
                onClick={() => handleActionSelect("Delete Task")}
              />
            </Space>
            {selectedAction && (
              <Card className="mt-4">
                {selectedAction === "Move to List" && (
                  <>
                    <Title level={4}>Move to column</Title>
                    <Select
                      style={{ width: '100%' }}
                      value={moveToList}
                      onChange={setMoveToList}
                    >
                      {tasks.map((task) => (
                        <Option key={task.id} value={task.name}>
                          {task.name}
                        </Option>
                      ))}
                    </Select>
                    <Text type="secondary">
                      The card will be moved to the specified column.
                    </Text>
                  </>
                )}
                {selectedAction === "Complete Task" && (
                  <Text type="secondary">
                    The selected task will be marked as complete.
                  </Text>
                )}
                {selectedAction === "Delete Task" && (
                  <Text type="secondary">
                    The selected task will be deleted.
                  </Text>
                )}
              </Card>
            )}
            <div className="mt-4 flex justify-between items-center">
              <div>
                {selectedAction && (
                  <Button type="primary" onClick={handleAddActionClick}>
                    Add Action
                  </Button>
                )}
              </div>
              <div>
                <Button onClick={handleBack}>
                  Back
                </Button>
              </div>
            </div>
          </>
        )}
        {currentStep === 2 && (
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            <Title level={3}>Review and Save</Title>
            <Card size="small">
              <Title level={4}>Trigger</Title>
              <Text>
                {selectedTrigger === "Card Move" && (
                  <>
                    When card status is marked as{" "}
                    <Text strong>{triggerCondition}</Text>
                  </>
                )}
                {selectedTrigger === "Card Changes" && (
                  <>
                    When card is moved to{" "}
                    <Text strong>{triggerCondition}</Text>
                  </>
                )}
              </Text>
              <Title level={4} className="mt-4">Action</Title>
              <Text>
                {selectedAction === "Move to List" && (
                  <>
                    Move to column <Text strong>{moveToList}</Text>
                  </>
                )}
                {selectedAction === "Complete Task" && (
                  <>Mark the task as completed</>
                )}
                {selectedAction === "Delete Task" && <>Delete the task</>}
                {selectedAction === "Assign Task" && (
                  <>
                    Assign task to <Text strong>{userEmail}</Text>
                  </>
                )}
              </Text>
            </Card>
            <Space className="mt-4">
              <Button type="primary" onClick={handleSaveRule}>
                Save Rule
              </Button>
              <Button onClick={() => setCurrentStep(1)}>
                Back
              </Button>
            </Space>
          </div>
        )}
      </Modal>

      <Modal
        title="Confirm Deletion"
        visible={showDeleteConfirmation}
        onOk={confirmDelete}
        onCancel={closeDeleteConfirmation}
      >
        <p>Are you sure you want to delete this rule?</p>
      </Modal>
      <button
        onClick={toggleDropdown}
        className="bg-purple-500 text-white px-4 py-2 rounded-full flex items-center"
      >
        Automation <ChevronDown className="ml-2" />
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
              <X size={20} />
            </button>


            <h2 className="text-2xl font-semibold mb-4">Create a Rule</h2>
            <div className="flex items-center space-x-4 mb-4">
              <div
                className={`rounded-full px-4 py-2 text-sm ${currentStep >= 1
                  ? "bg-green-200 text-green-800"
                  : "bg-gray-200"
                  }`}
              >
                1 Select trigger {currentStep > 1 && "✓"}
              </div>
              <div className="text-gray-400">&gt;</div>
              <div
                className={`rounded-full px-4 py-2 text-sm ${currentStep >= 2 ? "bg-blue-200 text-blue-800" : "bg-gray-200"
                  }`}
              >
                2 Select action {currentStep > 2 && "✓"}
              </div>
              <div className="text-gray-400">&gt;</div>
              <div
                className={`rounded-full px-4 py-2 text-sm ${currentStep === 3
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
                        {rule.triggerSentence || "No trigger sentence"} -
                      </p>
                      <p>{rule.actionSentence || "No action sentence"}</p>
                    </div>
                    <button onClick={() => openDeleteConfirmation(rule._id)}>
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
                  </div>
                )}
                {showTriggers && (
                  <div className="flex space-x-4 mt-4">
                    <button
                      className="bg-green-500 text-white py-2 px-4 rounded"
                      onClick={handleAddButtonClick}
                    >
                      Add Trigger
                    </button>
                    <button
                      className="bg-gray-300 text-gray-700 py-2 px-4 rounded"
                      onClick={() => setShowTriggers(false)}
                    >
                      Back
                    </button>
                  </div>
                )}
              </>
            )}

            {currentStep === 2 && (
              <>
                <h3 className="text-xl font-semibold mb-2">Select Action</h3>
                <div className=" gap-10">
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
                          Move to column 
                        </h4>
                        <select
                          className="border rounded w-full px-2 py-1 mb-2"
                          value={moveToList}
                          onChange={(e) => setMoveToList(e.target.value)}
                        >
                          <option value="">Select a column</option>
                          {tasks.map((task) => (
                            <option key={task.id} value={task.name}>
                              {task.name}
                            </option>
                          ))}
                        </select>

                        <p className="text-sm text-gray-600">
                          The card will be moved to the specified column.
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
                        Move to column <strong>{moveToList}</strong>
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

            {showDeleteConfirmation && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded-lg w-1/3">
                  <h3 className="text-xl font-semibold mb-4">Confirm Deletion</h3>
                  <p className="mb-6">Are you sure you want to delete this rule?</p>
                  <div className="flex justify-end space-x-4">
                    <button
                      className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                      onClick={closeDeleteConfirmation}
                    >
                      Cancel
                    </button>
                    <button
                      className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                      onClick={confirmDelete}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default RulesButton;



