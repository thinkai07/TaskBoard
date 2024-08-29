const renderCard = (card, { dragging }) => (
    <div
      className={`react-kanban-card ${dragging ? "dragging" : ""}`}
      style={{ borderRadius: "10px", maxWidth: "750px", overflow: "hidden" }}
      onClick={() => handleCardClick(card.id, card.columnId, projectId)}
    >
      <div className="p-4">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
          key={card.id} 
        >
          <div className="react-kanban-card__title truncate" title={card.title}>
            {card.title && card.title.length > 20
              ? card.title.slice(0, 20) + "..."
              : card.title}
          </div>
          <div className="react-kanban-card__assignedTo flex items-center">
            {card.assignedTo && (
              <div className="profile-picture w-6 h-6 rounded-full bg-blue-400 text-white flex justify-center items-center font-bold ml-2 relative">
              <Tooltip title={card.assignedTo}>
                <span className="cursor-pointer">
                  {card.assignedTo.charAt(0).toUpperCase()}
                </span>
              </Tooltip>
            </div>
            )}
          </div>
        </div>
        <div className="react-kanban-card__dueDate">
          {card.dueDate && (
            <div className="text-sm text-gray-500">
              Due Date:{" "}
              {new Date(card.dueDate).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "numeric",
                hour12: true,
              })}
            </div>
          )}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
      <div className="react-kanban-card__status">
        <Select
          value={card.status}
          onChange={(value) => handleChangeStatus(card.id, value)}
          onClick={(e) => e.stopPropagation()} // Prevent modal from opening
          style={{ width: 110, height: 25 }} // You can adjust the width as needed
        >
          <Option value="pending">Pending</Option>
          <Option value="inprogress">In Progress</Option>
          <Option value="completed">Completed</Option>
        </Select>
      </div>
      <div
        title={card.uniqueId}
        style={{ marginLeft: "10px", font: "small-caption" }}
      >
        <h1>ID:{card.cardId}</h1>
      </div>
    </div>

          {canShowActions && (
            <button
              className="delete-card-button"
              onClick={(e) => {
                e.stopPropagation(); // Prevent click event from bubbling up
                confirmRemoveCard(card.columnId, card.id);
              }}
              style={{
                marginRight: "10px",
                color: "red",
                paddingTop: "5px",
                marginLeft: "30%",
                marginTop: "3%",
              }}
            >
              {/* <BsTrash /> */}
            </button>
          )}
          <button
            className="delete-card-button"
            onClick={(e) => {
              e.stopPropagation(); // Prevent click event from bubbling up
              openRenameCardModal(
                card.columnId,
                card.id,
                card.title,
                card.description,
                card.comments,
                card.activities,
                card.taskLogs
              );
            }}
            style={{ color: "black", marginTop: "4%" }}
          >
            {/* <BsFillPencilFill /> */}
          </button>
        </div>
      </div>
    </div>
  );