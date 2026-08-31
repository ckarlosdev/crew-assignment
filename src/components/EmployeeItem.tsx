import React from "react";
import { Button } from "react-bootstrap";
import { useDrag } from "react-dnd";
import { useAbsenceStore } from "../store/useAbsenceStore";
import type { Hours } from "../types";

interface EmployeeItemProps {
  id: number;
  name: string;
  title: string;
  isDraggingPreview?: boolean;
  isAssigned: boolean;
  hrs: Hours | undefined;
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
  isAssigned,
  hrs,
}) => {
  const { setShowModal, setEmployeeIdSelected, setEmployeeNameSelected } =
    useAbsenceStore();
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.EMPLOYEE,
    item: { id, name }, // Solo necesitamos pasar el ID
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const itemStyle: React.CSSProperties = {
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
    display: "flex",
    alignItems: "center", // Centra verticalmente el botón y el texto
    justifyContent: "space-between", // Alinea todo al principio (izquierda)
    padding: "0 10px", // Un poco de aire en los bordes
    // width: "100%",
  };

  const handleAbsence = () => {
    setShowModal(true);
    setEmployeeIdSelected(id);
    setEmployeeNameSelected(name);
  };

  const dragRef = isDraggingPreview ? undefined : drag;

  return (
    // Asigna el ref 'drag' al elemento DOM
    <div ref={dragRef} style={itemStyle}>
      <span
        style={{
          fontWeight: title === "Supervisor" ? "bold" : "normal",
          whiteSpace: "nowrap", // Evita que el nombre salte de línea
          overflow: "hidden", // Corta el texto si es muy largo
          textOverflow: "ellipsis", // Agrega los "..."
          flexShrink: 1, // Permite que el nombre se encoja si falta espacio
          fontSize: "14px",
        }}
      >
        {name}
        {" - "}
        {hrs?.totalHrs ?? "0"}{" hrs"}
      </span>
      {isAssigned && !isDraggingPreview && (
        <Button
          variant="outline-danger"
          style={{
            fontWeight: "bold",
            minWidth: "45px",
            height: "20px",
            fontSize: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0",
            marginLeft: "auto",
          }}
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            handleAbsence();
          }}
        >
          ABSENCE
        </Button>
      )}
    </div>
  );
};
