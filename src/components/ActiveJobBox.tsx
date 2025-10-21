import React from "react";
import { useDrop, useDrag } from "react-dnd"; // <-- Importamos useDrag
import { EmployeeItem, ItemTypes as EmployeeItemTypes } from "./EmployeeItem";
import { ItemTypes as JobItemTypes } from "./JobItem"; // <-- Importamos los tipos de Job
import { Employee, Job } from "../types";

interface ActiveJobBoxProps {
  job: Job;
  employees: Employee[];
  onAssignEmployee: (employeeId: number, jobId: number) => void;
}

export const ActiveJobBox: React.FC<ActiveJobBoxProps> = ({
  job,
  employees,
  onAssignEmployee,
}) => {
  // --- 1. Hook useDrop (Para Empleados) ---
  const [{ isOver: isEmployeeOver }, drop] = useDrop(() => ({
    accept: EmployeeItemTypes.EMPLOYEE,
    drop: (item: { id: number }) => {
      // Lógica de asignación: asigna el empleado a ESTE job
      onAssignEmployee(item.id, job.id);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  // --- 2. Hook useDrag (Para arrastrar el Job hacia afuera) ---
  const [{ isDragging: isJobDragging }, drag] = useDrag(() => ({
    type: JobItemTypes.JOB,
    item: { id: job.id }, // Al arrastrar esta caja, enviamos el ID del Job
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  // 3. Combinar las referencias (drag y drop) en una sola función
  // Esto permite que el mismo elemento sea arrastrable y objetivo de soltado.
  const combinedRef = (node: HTMLDivElement | null) => {
    drag(node);
    drop(node);
  };

  const assignedEmployees = employees.filter((e) =>
    job.assignedEmployeeIds.includes(e.id)
  );

  const boxStyle: React.CSSProperties = {
    padding: "10px",
    border: isEmployeeOver ? "3px solid #28a745" : "1px solid #343a40",
    backgroundColor: isEmployeeOver ? "#d4edda" : "white",
    borderRadius: "6px",
    // Estilo de arrastre para el Job que se está sacando del contenedor
    opacity: isJobDragging ? 0.4 : 1,
    cursor: "move", // Para indicar que la caja es arrastrable
  };

  return (
    // 4. Usar la referencia combinada
    <div ref={combinedRef} style={boxStyle}>
      <div style={{ marginBottom: "5px" }}>
        <span style={{ fontWeight: "bold", fontSize: "25px" }}>
          {job.number} {job.title}
        </span>{" "}
        <span>{"( " + job.addess + " )"}</span>
      </div>
      {/* <p style={{ fontSize: "0.9rem", color: "#6c757d" }}>
        Arrastra empleados aquí:
      </p> */}

      <div style={{ display: "flex", flexWrap: "wrap", minHeight: "40px" }}>
        {assignedEmployees.length === 0 && (
          <span style={{ color: "red" }}>No employee assigned.</span>
        )}
        {assignedEmployees.map((employee) => (
          // 5. CLAVE: Renderizar EmployeeItem para que cada empleado sea arrastrable hacia la zona de desasignación
          <EmployeeItem
            key={employee.id}
            id={employee.id}
            name={employee.name}
            title={employee.title}
          />
        ))}
      </div>
    </div>
  );
};
