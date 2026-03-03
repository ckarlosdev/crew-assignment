import { useDrop } from "react-dnd";
import { Employee, Job } from "../types";
import { ItemTypes } from "./JobItem";
import { ActiveJobBox } from "./ActiveJobBox";

type AssignmentContainerProps = {
  jobs: Job[];
  employees: Employee[];
  activeJobIds: number[];
  onJobDrop: (jobId: number) => void;
  onAssignEmployee: (employeeId: number, jobId: number) => void;
  onUpdateJob: (jobId: number, changes: Partial<Job>) => void;
};

export const AssignmentContainer: React.FC<AssignmentContainerProps> = ({
  jobs,
  employees,
  activeJobIds,
  onJobDrop,
  onAssignEmployee,
  onUpdateJob,
}) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: ItemTypes.JOB,
    drop: (item: { id: number }) => {
      onJobDrop(item.id); // Llama a la función que actualiza activeJobIds en App
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  const activeJobs = jobs.filter((job) => activeJobIds.includes(job.id));

  const containerStyle: React.CSSProperties = {
    minHeight: "60vh",
    border: isOver ? "3px solid #6c757d" : "2px dashed gray", // Estilo de arrastre para JOB
    backgroundColor: isOver ? "#e9ecef" : "#f8f9fa",
    padding: "15px",
    borderRadius: "8px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    userSelect: "none",
    WebkitUserSelect: "none",
  };

  return (
    <div ref={drop} style={containerStyle}>
      {activeJobs.length === 0 && (
        <p style={{ color: "gray", textAlign: "center" }}>
          Drag a Job here to start assign employees.
        </p>
      )}

      {activeJobs.map((job) => (
        // 2. Renderiza la caja de asignación para cada Job activo
        <ActiveJobBox
          key={job.id}
          job={job}
          employees={employees}
          onAssignEmployee={onAssignEmployee}
          onUpdateJob={onUpdateJob}
        />
      ))}
    </div>
  );
};
