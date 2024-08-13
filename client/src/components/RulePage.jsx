// //rulespage.jsx
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