export type Assignment = {
  assignmentsId: number;
  createdBy: string;
  startDate: string;
  endDate: string;
  assignmentJobCreateDtoList: number[];
};

export type Assign = {
  assignmentsId: number;
  createdBy: string;
  startDate: string;
  endDate: string;
  assignmentJobDtos: jobApi[];
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
  addess: string;
  assignedEmployeeIds: number[];
};

export type jobApi = {
  jobsId: number;
  assignmentEmployeeDtos: EmployeeData[];
}

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
