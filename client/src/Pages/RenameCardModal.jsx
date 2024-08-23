import React from "react";
import { Modal, Input, Button, Tabs, List, Avatar, Progress, Typography } from "antd";
import { CloseOutlined, CommentOutlined } from "@ant-design/icons";

const { Text, Title } = Typography;
const { TextArea } = Input;

const RenameCardModal = ({
    renameCardModalVisible,
    handleCancel,
    handleRenameCard,
    isEditingTitle,
    renameCardTitle,
    setRenameCardTitle,
    setRenameCardErrors,
    handleTitleBlur,
    renameCardErrors,
    setIsEditingTitle,
    isEditingDescription,
    renameCardDescription,
    setRenameCardDescription,
    handleDescriptionBlur,
    setIsEditingDescription,
    items,
    projectName,
    assignedTo,
    assignedBy,
    endDate,
    estimatedTimePercent,
    utilizedTimePercent,
    remainingTimePercent,
    activities,
    taskLogs,
    userEmail,
    userComment,
    setUserComment,
    handleSaveComment,
    commentsVisible,
    comments,
}) => {
    return (
        <div>
            <Modal
                visible={renameCardModalVisible}
                onCancel={handleCancel}
                footer={null}
                width="60%"
                closeIcon={<CloseOutlined />}
                centered
                className="rounded-lg shadow-lg"
                bodyStyle={{ padding: "20px", maxHeight: "80vh" }}
            >
                <form onSubmit={handleRenameCard}>
                    <div className="flex justify-between">
                        {/* Left Side: Card Title and Description */}
                        <div className="w-2/3 pr-4">
                            <div className="mb-4">
                                {isEditingTitle ? (
                                    <Input
                                        value={renameCardTitle}
                                        onChange={(e) => {
                                            setRenameCardTitle(e.target.value);
                                            setRenameCardErrors((prev) => ({
                                                ...prev,
                                                title: "",
                                            }));
                                        }}
                                        onBlur={handleTitleBlur}
                                        onPressEnter={handleTitleBlur}
                                        className={`${renameCardErrors.title ? "border-red-500" : "border-gray-300"
                                            } rounded-xl px-4 py-2 mt-5 w-full`}
                                        placeholder="Card Title"
                                        autoFocus
                                    />
                                ) : (
                                    <Text
                                        onDoubleClick={() => setIsEditingTitle(true)}
                                        className="cursor-pointer"
                                    >
                                        {renameCardTitle}
                                    </Text>
                                )}
                                {renameCardErrors.title && (
                                    <Text type="danger" className="text-sm mt-1">
                                        {renameCardErrors.title}
                                    </Text>
                                )}
                            </div>

                            <div className="mb-4">
                                {isEditingDescription ? (
                                    <>
                                        <TextArea
                                            value={renameCardDescription}
                                            onChange={(e) => {
                                                setRenameCardDescription(e.target.value);
                                                setRenameCardErrors((prev) => ({
                                                    ...prev,
                                                    description: "",
                                                }));
                                            }}
                                            onBlur={handleDescriptionBlur}
                                            onPressEnter={handleDescriptionBlur}
                                            className={`${renameCardErrors.description ? "border-red-500" : "border-gray-300"
                                                } rounded-xl px-4 py-2 w-full`}
                                            placeholder="Card Description"
                                            autoFocus
                                        />
                                        {renameCardErrors.description && (
                                            <Text type="danger" className="text-sm mt-1">
                                                {renameCardErrors.description}
                                            </Text>
                                        )}
                                        <div className="flex justify-end mt-4">
                                            <Button
                                                onClick={() => setIsEditingDescription(false)}
                                                className="mr-2"
                                            >
                                                Cancel
                                            </Button>
                                            <Button type="primary" onClick={handleRenameCard}>
                                                Save
                                            </Button>
                                        </div>
                                    </>
                                ) : (
                                    <Text
                                        onDoubleClick={() => setIsEditingDescription(true)}
                                        className="cursor-pointer"
                                    >
                                        {renameCardDescription}
                                    </Text>
                                )}
                            </div>
                            <div className="mb-4">
                                <Tabs defaultActiveKey="1" items={items} />
                            </div>
                        </div>

                        {/* Right Side: Project Info */}
                        <div className="w-1/3 pl-4">
                            <div className="mb-4">
                                <Text strong>Project Name:</Text>
                                <Text>{projectName}</Text>
                            </div>
                            <div className="mb-4">
                                <Text strong>Assigned To:</Text>
                                <Text>{assignedTo}</Text>
                            </div>
                            <div className="mb-4">
                                <Text strong>Assigned By:</Text>
                                <Text>{assignedBy}</Text>
                            </div>
                            <div className="mb-4">
                                <Text strong>End Date:</Text>
                                <Text>{endDate}</Text>
                            </div>
                            <div className="flex justify-between mt-6">
                                <div className="w-full mt-20 ">
                                    <Text strong className="block mb-4 text-xl">
                                        Progress
                                    </Text>
                                    <div className="mb-4">
                                        <Text>Estimated Time:</Text>
                                        <Progress percent={estimatedTimePercent || 0} />
                                    </div>
                                    <div className="mb-4">
                                        <Text>Utilized Time:</Text>
                                        <Progress percent={utilizedTimePercent || 0} />
                                    </div>
                                    <div className="mb-4">
                                        <Text>Remaining Time:</Text>
                                        <Progress percent={remainingTimePercent || 0} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default RenameCardModal;
