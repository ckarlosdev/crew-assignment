import React from "react";
import { useDrag } from "react-dnd";

export interface JobItemProps {
  id: number;
  number: string;
  title: string;
  isActive: boolean;
  assigned: number;
  isDraggingPreview?: boolean;
}

export const ItemTypes = {
  JOB: "job",
};

export const JobItem: React.FC<JobItemProps> = ({
  id,
  number,
  title,
  assigned,
  isActive,
  isDraggingPreview,
}) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.JOB,
    item: { id, title, number, assigned, isActive }, // Al arrastrar, solo necesitamos pasar el ID del Job

    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const itemStyle: React.CSSProperties = {
    padding: "10px",
    color: "#2d3436",
    marginBottom: "6px",
    cursor: number && title ? (isDraggingPreview ? "default" : "move") : "wait",
    borderRadius: "6px",
    backgroundColor: isActive ? "#f7b731" : "#ffeaa7",
    border: isActive ? "2px solid #e17055" : "1px solid #fdcb6e",
    opacity: isDraggingPreview ? 1 : isDragging ? 0.4 : 1,
    fontWeight: isActive ? "bold" : "normal",
    boxShadow: isActive
      ? "0 2px 6px rgba(225,112,85,0.4)"
      : "0 1px 3px rgba(0,0,0,0.1)",
    userSelect: "none",
    transition: "all 0.15s ease",
  };

  const dragRef = isDraggingPreview ? undefined : drag;

  return (
    <div
      ref={dragRef}
      style={itemStyle}
      title={number && title ? undefined : "Datos no listos"}
    >
      <span style={{ fontWeight: "bold" }}>
        #{number ?? "..."}{" "}
        {title ?? "..."}
      </span>{" "}
      ({assigned ?? "..."})
    </div>
  );
};
