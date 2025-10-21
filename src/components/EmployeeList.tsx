import React from "react";
import { useDrop } from "react-dnd";
import { EmployeeItem, ItemTypes } from "./EmployeeItem"; // Crea este archivo
import { Employee } from "../types";

interface EmployeeListProps {
  employees: Employee[];
  onUnassignEmployee: (employeeId: number) => void;
}

// Zona de empleados disponibles: DropTarget para desasignar
export const EmployeeList: React.FC<EmployeeListProps> = ({
  employees,
  onUnassignEmployee,
}) => {
  // 1. Hook useDrop para convertir toda la lista en una zona de desasignación
  const [{ isOver }, drop] = useDrop(() => ({
    accept: ItemTypes.EMPLOYEE,
    drop: (item: { id: number }) => {
      // Lógica de desasignación
      onUnassignEmployee(item.id);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  const availableEmployees = employees.filter((e) => e.status === "available");

  return (
    // 2. Adjuntamos la referencia 'drop' a la lista
    <div
      ref={drop}
      style={{
        border: isOver ? "3px dashed orange" : "1px solid #ccc",
        padding: "10px",
        // height: "50vh",
        overflowY: "auto",
        backgroundColor: isOver ? "#fff3e0" : "white",
      }}
    >
      {availableEmployees.length === 0 && (
        <p style={{ color: "gray" }}>
          No hay empleados disponibles para arrastrar.
        </p>
      )}
      {availableEmployees.map((employee) => (
        // 3. Renderizamos los ítems arrastrables
        <EmployeeItem
          key={employee.id}
          id={employee.id}
          name={employee.name}
          title={employee.title}
        />
      ))}
      {isOver && (
        <div style={{ textAlign: "center", color: "orange" }}>
          SUELTA para DESASIGNAR
        </div>
      )}
    </div>
  );
};
