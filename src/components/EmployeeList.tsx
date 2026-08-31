import React from "react";
import { useDrop } from "react-dnd";
import { EmployeeItem, ItemTypes } from "./EmployeeItem"; // Crea este archivo
import { Employee, type Hours } from "../types";

interface EmployeeListProps {
  employees: Employee[];
  onUnassignEmployee: (employeeId: number) => void;
  empHours: Hours[];
}

// Zona de empleados disponibles: DropTarget para desasignar
export const EmployeeList: React.FC<EmployeeListProps> = ({
  employees,
  onUnassignEmployee,
  empHours,
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
        <p style={{ color: "gray" }}>No employees to drag.</p>
      )}
      {availableEmployees.map((employee) => {
        
        const hrs = empHours?.find?.((eh) => eh.employeesId === employee.id);

        return (
          <EmployeeItem
            key={employee.id}
            id={employee.id}
            name={employee.name}
            title={employee.title}
            isAssigned={true}
            hrs={hrs}
          />
        );
      })}
      {isOver && (
        <div style={{ textAlign: "center", color: "orange" }}>
          Release to assign
        </div>
      )}
    </div>
  );
};
