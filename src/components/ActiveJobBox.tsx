import React from "react";
import { useDrop, useDrag } from "react-dnd"; // <-- Importamos useDrag
import { EmployeeItem, ItemTypes as EmployeeItemTypes } from "./EmployeeItem";
import { ItemTypes as JobItemTypes } from "./JobItem"; // <-- Importamos los tipos de Job
import { Employee, Job } from "../types";

interface ActiveJobBoxProps {
  job: Job;
  employees: Employee[];
  onAssignEmployee: (employeeId: number, jobId: number) => void;
  onUpdateJob: (jobId: number, changes: Partial<Job>) => void;
}

export const ActiveJobBox: React.FC<ActiveJobBoxProps> = ({
  job,
  employees,
  onAssignEmployee,
  onUpdateJob,
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

  const inputContainerStyle: React.CSSProperties = {
    display: "flex",
    gap: "10px",
    marginBottom: "10px",
    padding: "8px",
    backgroundColor: "#f8f9fa",
    borderRadius: "4px",
    border: "1px solid #dee2e6",
  };

  const inputStyle: React.CSSProperties = {
    padding: "4px 8px",
    borderRadius: "4px",
    border: "1px solid #ced4da",
    fontSize: "0.9rem",
  };

  const assignedEmployees = employees.filter((e) =>
    job.assignedEmployeeIds.includes(e.id),
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
        <span>{"( " + job.address + " )"}</span>
      </div>
      {/* <p style={{ fontSize: "0.9rem", color: "#6c757d" }}>
        Arrastra empleados aquí:
      </p> */}

      {/* --- NUEVA SECCIÓN: Campos Editables --- */}
      <div
        style={inputContainerStyle}
        onMouseDown={(e) => e.stopPropagation()} // BLOQUEA el arrastre al hacer clic aquí
      >
        <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
          <label
            style={{
              fontSize: "0.75rem",
              fontWeight: "bold",
              color: "#495057",
            }}
          >
            Start Hour
          </label>
          <input
            type="time"
            style={inputStyle}
            value={job.startTime}
            onChange={(e) => onUpdateJob(job.id, { startTime: e.target.value })}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", flex: 2 }}>
          <label
            style={{
              fontSize: "0.75rem",
              fontWeight: "bold",
              color: "#495057",
            }}
          >
            Comments
          </label>
          <input
            type="text"
            placeholder="Add notes..."
            style={inputStyle}
            value={job.assignmentComment}
            onChange={(e) =>
              onUpdateJob(job.id, { assignmentComment: e.target.value })
            }
          />
        </div>
      </div>

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
