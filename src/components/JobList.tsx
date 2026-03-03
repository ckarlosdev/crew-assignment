import React from "react";
import { useDrop } from "react-dnd";
import { Job } from "../types";
import { ItemTypes, JobItem } from "./JobItem";

type JobListProps = {
  jobs: Job[];
  activeJobIds: number[];
  onJobDeactivation: (jobId: number) => void;
};

export const JobList: React.FC<JobListProps> = ({
  jobs,
  activeJobIds,
  onJobDeactivation,
}) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: ItemTypes.JOB,
    drop: (item: { id: number }) => {
      onJobDeactivation(item.id); // Llama a la lógica de desactivación
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  // console.log("Jobs en JobList:", jobs);
  return (
    <div
      ref={drop}
      style={{
        border: isOver ? "3px dashed red" : "1px solid #ccc",
        backgroundColor: isOver ? "#f8d7da" : "white",
        // ... (demás estilos)
      }}
    >
      {jobs.map((job) => (
        <JobItem
          key={job.id}
          id={job.id}
          number={job.number}
          title={job.title}
          assigned={job.assignedEmployeeIds.length}
          isActive={activeJobIds.includes(job.id)}
          address={job.address}
        />
      ))}
    </div>
  );
};
