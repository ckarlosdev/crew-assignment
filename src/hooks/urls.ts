// const base = "https://checklist-api-8j62.onrender.com/api/v1";

const base = "http://localhost:8082/api/v1";

export const searchJobstsURL = () => `${base}/job`;
export const searchEmployeestsURL = () => `${base}/employee`;
export const searchAssignmentsURL = () => `${base}/assignments`;
export const searchAssignURL = (id: number) => `${base}/assignment/${id}`;
export const submitAssignmentURL = () => `${base}/assignment`;
