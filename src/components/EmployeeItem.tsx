import React from "react";
import { useDrag } from "react-dnd";

interface EmployeeItemProps {
  id: number;
  name: string;
  title: string;
  isDraggingPreview?: boolean;
}

// Define el tipo de elemento arrastrable.
export const ItemTypes = {
  EMPLOYEE: "employee",
};

export const EmployeeItem: React.FC<EmployeeItemProps> = ({
  id,
  name,
  title,
  isDraggingPreview,
}) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.EMPLOYEE,
    item: { id, name }, // Solo necesitamos pasar el ID
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const itemStyle: React.CSSProperties = {
    padding: "8px",
    marginBottom: isDraggingPreview ? 0 : "8px",
    cursor: isDraggingPreview ? "default" : "move",
    backgroundColor: "#d1e7dd",
    border: "1px solid #a3cfb5",
    borderRadius: "4px",
    opacity: isDraggingPreview ? 1 : isDragging ? 0.4 : 1,
    userSelect: "none",
    WebkitUserSelect: "none",
    MozUserSelect: "none",
    msUserSelect: "none",
    // width: "250px",
  };

  const dragRef = isDraggingPreview ? undefined : drag;

  return (
    // Asigna el ref 'drag' al elemento DOM
    <div ref={dragRef} style={itemStyle}>
      <span style={{ fontWeight: title === "Supervisor" ? "bold" : "normal" }}>
        {name}
      </span>
      {title === "Supervisor" ? (
        <>
          {" ("}
          <span style={{ fontWeight: "bold" }}>{title}</span>
          {")"}
        </>
      ) : null}
    </div>
  );
};
