export type Assignment = {
  assignmentsId: number;
  createdBy: string;
  startDate: string;
  endDate: string;
  assignmentJobCreateDtoList: number[];
  absenceCreateDtoList: Absence[];
};

export type Assign = {
  assignmentsId: number;
  createdBy: string;
  startDate: string;
  endDate: string;
  assignmentJobDtos: jobApi[];
  absences: Absence[];
};

export type Employee = {
  id: number;
  name: string;
  title: string;
  status: "available" | "assigned";
};

export type Job = {
  id: number;
  title: string;
  number: string;
  address: string;
  startTime: string;
  assignmentComment: string;
  assignedEmployeeIds: number[];
};

export type jobApi = {
  jobsId: number;
  startTime: string;
  assignmentComment: string;
  assignmentEmployeeDtos: EmployeeData[];
};

export type JobData = {
  address: string;
  contact: string;
  contractor: string;
  jobsId: number;
  name: string;
  number: string;
  status: string;
  type: string;
};

export type EmployeeData = {
  employeesId: number;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  status: string;
  title: string;
};

export type Absence = {
  temporalId: string;
  assignmentsAbsencesId: number | null;
  employeesId: number | null;
  absenceType: string;
  comments: string;
};

export type Hours = {
  name: string;
  employeesId: number;
  totalHrs: number;
};
