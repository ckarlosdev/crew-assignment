import { ChangeEvent, useCallback, useEffect, useMemo, useState } from "react";
import {
  Assign,
  Assignment,
  Employee,
  EmployeeData,
  Job,
  JobData,
} from "./types";
import { DndProvider } from "react-dnd";
import { JobList } from "./components/JobList";
import { EmployeeList } from "./components/EmployeeList";
import { AssignmentContainer } from "./components/AssignmentContainer";
import { dndMultiBackendConfig } from "./DndConfig";
import { MultiBackend } from "react-dnd-multi-backend";
import { CustomDragLayer } from "./CustomDragLayer";
import "./styles/App.css";
import useHttpsData from "./hooks/useHttpsData";
import {
  searchAssignmentsURL,
  searchAssignURL,
  searchEmployeestsURL,
  searchJobstsURL,
  submitAssignmentURL,
} from "./hooks/urls";
import { Button, Card, ListGroup, Modal } from "react-bootstrap";

const getTodayDateString = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatDateToString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatDBDateToUS = (dbDateString: string) => {
  if (!dbDateString || typeof dbDateString !== "string") {
    return dbDateString;
  }
  const parts = dbDateString.split("-");

  if (parts.length === 3) {
    const [year, month, day] = parts;
    return `${month}/${day}/${year}`;
  }
  return dbDateString;
};

function App() {
  const [jobsDetail, setJobsDetail] = useState<JobData[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [employeesDetail, setEmployeesDetail] = useState<EmployeeData[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  const [employees, setEmployees] = useState<Employee[]>([]);
  // const [jobNumbers, setJobNumbers] = useState(10);
  const todayString = getTodayDateString();
  const [startDate, setStartDate] = useState<string | null>(todayString);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [assignmentId, setAssignmentId] = useState<number>(0);
  const [show, setShow] = useState(true);
  const [showModalSave, setShowModalSave] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleCloseModalSave = () => {
    setShowModalSave(false);
  };
  const handleShowModalSave = () => {
    setShowModalSave(true);
  };

  const handleClose = () => {
    setShow(false);
  };

  const handleShow = () => setShow(true);

  const handleNew = () => {
    setActiveJobIds([]);
    setAssignmentId(0);
    setShow(false);
    setJobs((prevJobs) => {
      return prevJobs.map((job) => ({
        ...job,
        assignedEmployeeIds: [],
      }));
    });
    setEmployees((prevEmployees) => {
      return prevEmployees.map((employee) => {
        if (employee.status !== "available") {
          return {
            ...employee,
            status: "available",
          };
        }
        return employee;
      });
    });
  };

  const [activeJobIds, setActiveJobIds] = useState<number[]>([]);
  const { postData: submitAssignment, putData: updateAssignment } =
    useHttpsData<Assignment>();

  const { data: jobsData, search: searchJobs } = useHttpsData<JobData[]>();
  const { data: assignmentsData, search: searchAssignments } =
    useHttpsData<Assignment[]>();

  const { data: assignData, search: searchAssign } = useHttpsData<Assign>();
  const { data: employeeData, search: searchEmployees } =
    useHttpsData<EmployeeData[]>();

  useEffect(() => {
    const urlJobs = searchJobstsURL();
    searchJobs(urlJobs);

    const urlEmp = searchEmployeestsURL();
    searchEmployees(urlEmp);

    const urlAssig = searchAssignmentsURL();
    searchAssignments(urlAssig);
  }, []);

  const handleShowAssignment = () => {
    setShow(false);
    // let assig = assignData?.find(assign => assign.assignmentsId == assignmentId);

    const urlAssigment = searchAssignURL(assignmentId);
    searchAssign(urlAssigment);
  };

  const filteredJobs = useMemo(() => {
    const sortedDescending = [...jobsDetail].sort(
      (a, b) => b.jobsId - a.jobsId
    );
    // const lastNJobs = sortedDescending.slice(0, jobNumbers);
    const transformedJobs: Job[] = sortedDescending.map((data) => ({
      id: data.jobsId, // Map jobsId to the required id field
      title: data.name, // Map name (or another field) to title
      number: data.number,
      addess: data.address,
      assignedEmployeeIds: [], // Initialize the assignment array as empty
    }));

    return transformedJobs;
  }, [jobsDetail]);
  // }, [jobsDetail, jobNumbers]);

  useEffect(() => {
    setJobs(filteredJobs);
  }, [filteredJobs]);

  const filteredEmployees = useMemo(() => {
    // const sortedDescending = [...employeesDetail].sort((a, b) =>
    //   a.firstName.localeCompare(b.firstName)
    // );

    // const filteredEmployees = [...sortedDescending].filter(
    //   (employee) =>
    //     (employee.title === "Labor" || employee.title === "Supervisor") &&
    //     employee.status != "Terminated"
    // );

    const eligibleEmployees = employeesDetail.filter(
      (employee) =>
        (employee.title === "Labor" || employee.title === "Supervisor") &&
        employee.status !== "Terminated"
    );

    // 2. Aplicar el orden personalizado con un Custom Comparator
    const sortedEmployees = eligibleEmployees.sort((a, b) => {
      // Define la prioridad del título (Supervisor = 1, Labor = 2)
      // Usamos un número más bajo para la prioridad más alta (Supervisor)
      const getTitlePriority = (title: string) => {
        if (title === "Supervisor") return 1;
        if (title === "Labor") return 2;
        return 3; // Para otros títulos, si existieran (aunque ya están filtrados)
      };

      const priorityA = getTitlePriority(a.title);
      const priorityB = getTitlePriority(b.title);

      // PRIMER CRITERIO DE ORDEN: Prioridad del Título
      if (priorityA !== priorityB) {
        return priorityA - priorityB; // Si son diferentes, ordena por prioridad (1 antes que 2)
      }

      // SEGUNDO CRITERIO DE ORDEN: Orden alfabético por Nombre
      // Si tienen la misma prioridad (ambos Supervisor o ambos Labor), ordena por nombre.
      return a.firstName.localeCompare(b.firstName);
    });

    const transformedEmployees: Employee[] = sortedEmployees.map((data) => ({
      id: data.employeesId,
      name: data.firstName + " " + data.lastName,
      title: data.title,
      status: "available",
    }));

    return transformedEmployees;
  }, [employeesDetail]);

  const handleAssignmentSelected = (assignmentId: number) => {
    setAssignmentId(assignmentId);
  };

  const handleStartDateChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newStartDateString = e.target.value;
    setStartDate(newStartDateString);
  };

  useEffect(() => {
    const newStartDateObject = new Date(startDate + "T00:00:00");
    newStartDateObject.setDate(newStartDateObject.getDate() + 6);
    const newEndDateString = formatDateToString(newStartDateObject);
    setEndDate(newEndDateString);
  }, [startDate]);

  const handleEndDateChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEndDate(e.target.value);
  };

  useEffect(() => {
    setEmployees(filteredEmployees);
  }, [filteredEmployees]);

  useEffect(() => {
    if (jobsData) {
      setJobsDetail(jobsData);
    }
  }, [jobsData]);

  useEffect(() => {
    if (employeeData) {
      setEmployeesDetail(employeeData);
    }
  }, [employeeData]);

  useEffect(() => {
    if (assignmentsData) {
      const sortedDescending = [...assignmentsData].sort(
        (a, b) => b.assignmentsId - a.assignmentsId
      );
      setAssignments(sortedDescending);
    }
  }, [assignmentsData]);

  useEffect(() => {
    if (assignData) {
      setStartDate(assignData ? assignData?.startDate : "");
      setEndDate(assignData ? assignData?.endDate : "");
      setAssignmentId(assignData ? assignData?.assignmentsId : 0);
      if (assignData.assignmentJobDtos) {
        const newJobIds: number[] = [];
        const allAssignedEmployeeIds: number[] = [];
        // const jobIds = assignData.assignmentJobDtos.map((job) => job.jobsId);

        const updatedJobs = jobs.map((appJob) => {
          const loadedJobDto = assignData.assignmentJobDtos.find(
            (dto) => dto.jobsId === appJob.id
          );
          if (loadedJobDto) {
            newJobIds.push(appJob.id);
            const employeeDtos = loadedJobDto.assignmentEmployeeDtos || [];
            const assignedIds = employeeDtos.map((emp) => emp.employeesId);
            allAssignedEmployeeIds.push(...assignedIds);
            return {
              ...appJob,
              assignedEmployeeIds: assignedIds || [],
            } as Job;
          }
          if (appJob.assignedEmployeeIds.length > 0) {
            return { ...appJob, assignedEmployeeIds: [] } as Job;
          }
          return appJob;
        });

        setEmployees((prevEmployees) => {
          return prevEmployees.map((employee) => {
            const isAssigned = allAssignedEmployeeIds.includes(employee.id);

            if (isAssigned) {
              // Cambiar el status a 'assigned'
              return { ...employee, status: "assigned" };
            }

            // Si el empleado NO está en la lista cargada, aseguramos que su status sea 'available'
            if (employee.status !== "available") {
              return { ...employee, status: "available" };
            }

            return employee;
          });
        });

        setJobs(updatedJobs);
        setActiveJobIds(newJobIds);
      } else {
        setActiveJobIds([]);
      }
    }
  }, [assignData]);

  // useEffect(() => {
  //   console.log(jobs);
  // }, [jobs]);

  // -----------------------------------------------------------
  // FUNCIÓN: ARRASTRAR JOB A ZONA CENTRAL
  // -----------------------------------------------------------
  const handleJobActivation = useCallback((jobId: number) => {
    // Usa la forma funcional para evitar problemas de dependencia
    setActiveJobIds((prevIds) => {
      // Solo agrega si no existe para evitar duplicados en la caja central
      if (!prevIds.includes(jobId)) {
        return [...prevIds, jobId];
      }
      return prevIds;
    });
  }, []);

  // LÓGICA PARA ARRASTRAR JOB FUERA DEL CENTRO
  const handleJobDeactivation = useCallback(
    (jobId: number) => {
      // 1. En lugar de leer 'jobs' aquí, usaremos el callback de setJobs para
      // encontrar el job a desactivar y obtener los IDs.

      // Variable para almacenar temporalmente los IDs de los empleados.
      let employeesToUnassign: number[] = [];

      // 2. Limpiar Asignaciones en el Job y obtener los empleados asignados
      setJobs((prevJobs) => {
        return prevJobs.map((job) => {
          if (job.id === jobId) {
            // 💡 OBTENEMOS la lista de IDs del estado MÁS RECIENTE (prevJobs)
            employeesToUnassign = job.assignedEmployeeIds;

            return {
              ...job,
              assignedEmployeeIds: [], // Limpiar la asignación
            };
          }
          return job;
        });
      });

      // 3. Desasignar Empleados: Actualizar su status a 'available'
      // Esto solo se ejecuta si employeesToUnassign fue poblado.
      if (employeesToUnassign.length > 0) {
        setEmployees((prevEmployees) => {
          return prevEmployees.map((employee) => {
            if (employeesToUnassign.includes(employee.id)) {
              return {
                ...employee,
                status: "available",
              };
            }
            return employee;
          });
        });
      }

      // 4. Remover el Job del contenedor activo (Eliminar de activeJobIds)
      setActiveJobIds((prevIds) => prevIds?.filter((id) => id !== jobId));
    },
    // 💡 DEPENDENCIAS ACTUALIZADAS: 'jobs' ya no es necesario aquí
    [setEmployees, setJobs, setActiveJobIds]
  );

  // Esta función se pasará a AssignmentContainer
  const handleAssignEmployee = useCallback(
    (employeeId: number, jobId: number) => {
      // --- 1. ACTUALIZAR EL ESTADO DEL JOB (Añadir el Empleado) ---
      setJobs((prevJobs) => {
        return prevJobs.map((job) => {
          // Si encontramos el job que recibió la asignación
          if (job.id === jobId) {
            // Evitar duplicados: solo agregamos si el ID NO está ya en la lista
            if (!job.assignedEmployeeIds.includes(employeeId)) {
              return {
                ...job,
                // Crear un nuevo array con el nuevo empleado
                assignedEmployeeIds: [...job.assignedEmployeeIds, employeeId],
              };
            }
          }
          // Devolver el job sin cambios si no es el objetivo o si ya estaba asignado
          return job;
        });
      });

      // --- 2. ACTUALIZAR EL ESTADO DEL EMPLOYEE (Cambiar el Status) ---
      setEmployees((prevEmployees) => {
        return prevEmployees.map((employee) => {
          // Si encontramos el empleado que fue asignado
          if (employee.id === employeeId) {
            return {
              ...employee,
              // Cambiar su estado a 'assigned'
              status: "assigned",
            };
          }
          // Devolver el empleado sin cambios
          return employee;
        });
      });
    },
    []
  );

  // Esta función se pasará a EmployeeList (como DropTarget)
  const handleUnassignEmployee = useCallback((employeeId: number) => {
    // 1. ACTUALIZAR EL ESTADO DEL JOB (Remover el Empleado)
    setJobs((prevJobs) => {
      return prevJobs.map((job) => {
        // Buscamos el job que actualmente tiene asignado a este empleado
        if (job.assignedEmployeeIds.includes(employeeId)) {
          return {
            ...job,
            // Filtramos y removemos el ID del empleado del array
            assignedEmployeeIds: job.assignedEmployeeIds.filter(
              (id) => id !== employeeId
            ),
          };
        }
        // Devolver el job sin cambios si no es relevante
        return job;
      });
    });

    // 2. ACTUALIZAR EL ESTADO DEL EMPLOYEE (Cambiar el Status a 'available')
    setEmployees((prevEmployees) => {
      return prevEmployees.map((employee) => {
        if (employee.id === employeeId) {
          return {
            ...employee,
            status: "available",
          };
        }
        return employee;
      });
    });
  }, []);

  const handleReviewId = () => {
    if (assignmentId != 0) {
      handleShowModalSave();
    } else {
      handleSubmit("new");
    }
  };

  const handleSubmit = async (action: string) => {
    setSaving(true);
    if (activeJobIds && activeJobIds.length > 0) {
      const jobslist = jobs.filter((job) => activeJobIds.includes(job.id));
      const allHaveEmployees = jobslist.every(
        (job) => job.assignedEmployeeIds && job.assignedEmployeeIds.length > 0
      );

      if (allHaveEmployees) {
        var data = {
          assignmentId: action === "new" ? 0 : assignmentId,
          createdBy: "pending",
          startDate: startDate,
          endDate: endDate,
          assignmentJobCreateDtoList: jobslist,
        };

        let result: Assignment | undefined;
        if (action === "new") {
          result = await submitAssignment(submitAssignmentURL(), data);
        } else {
          result = await updateAssignment(submitAssignmentURL(), data);
        }

        if (result && result?.assignmentsId) {
          setAssignmentId(result?.assignmentsId);
          if (action === "new") {
            setAssignments((prev) => {
              return [...prev, result];
            });
          }
        }
        setSaving(false);
        alert("Assignment data saved.");
      } else {
        alert("Jobs selected doesn't have employes assigned.");
      }
    } else {
      alert("Select a job.");
    }
  };

  // console.log(jobs);

  return (
    <>
      <DndProvider
        backend={MultiBackend as any}
        options={dndMultiBackendConfig}
      >
        <div
          style={{
            textAlign: "center",
            marginTop: "20px",
            marginBottom: "10px",
          }}
        >
          <img
            style={{ width: "250px" }}
            src="../src/assets/hmbLogo.png"
            alt=""
          />
        </div>
        <div style={{ textAlign: "center", marginBottom: "10px" }}>
          <input
            id="start"
            style={{
              textAlign: "center",
              fontWeight: "bold",
              fontSize: "20px",
            }}
            type="date"
            value={startDate || ""}
            onChange={handleStartDateChange}
          />
          <span style={{ fontWeight: "bold", fontSize: "x-large" }}> - </span>
          <input
            id="end"
            style={{
              textAlign: "center",
              fontWeight: "bold",
              fontSize: "20px",
            }}
            type="date"
            value={endDate || ""}
            onChange={handleEndDateChange}
            min={startDate || ""}
            disabled={!startDate}
          />
        </div>
        <CustomDragLayer />
        <div className="app-main-layout">
          <div className="job-list-container">
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <h2 style={{ textAlign: "center" }}>Jobs</h2>
            </div>
            <JobList
              jobs={jobs}
              activeJobIds={activeJobIds}
              onJobDeactivation={handleJobDeactivation}
            />
          </div>

          <div className="assignment-container-main">
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                // justifyContent: "center",
                justifyContent: "space-between",
                // alignContent: "center",
                alignItems: "center",
                width: "100%",
                padding: "0 20px",
              }}
            >
              <button
                style={{
                  width: "100px",
                  height: "40px",
                  // marginLeft: "auto",
                  // marginRight: "20px",
                  // marginTop: "15px",
                  marginBottom: "10px",
                  fontWeight: "bold",
                  fontSize: "18px",
                  borderRadius: "10px",
                }}
                onClick={handleShow}
              >
                List
              </button>
              <h2 style={{ textAlign: "center", margin: "0" }}>
                Assignment Zone
              </h2>
              <button
                style={{
                  width: "100px",
                  height: "40px",
                  // marginLeft: "auto",
                  // marginRight: "20px",
                  // marginTop: "15px",
                  fontWeight: "bold",
                  fontSize: "18px",
                  borderRadius: "10px",
                }}
                onClick={handleReviewId}
                disabled={!saving ? false : true}
              >
                {!saving ? "Save" : "Saving..."}
              </button>
            </div>
            <AssignmentContainer
              jobs={jobs}
              employees={employees}
              activeJobIds={activeJobIds}
              onJobDrop={handleJobActivation}
              onAssignEmployee={handleAssignEmployee}
            />
          </div>

          <div className="employee-list-container">
            <h2 style={{ textAlign: "center" }}>Employees</h2>
            <EmployeeList
              employees={employees}
              onUnassignEmployee={handleUnassignEmployee}
            />
          </div>
        </div>
      </DndProvider>

      <Modal
        show={show}
        onHide={handleClose}
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header closeButton>
          <Modal.Title>Assignments created</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Card>
            <ListGroup style={{ maxHeight: "400px", overflowY: "auto" }}>
              {assignments.map((assign) => (
                <ListGroup.Item
                  action
                  key={assign.assignmentsId}
                  style={{ textAlign: "center", fontWeight: "bold" }}
                  onClick={() =>
                    handleAssignmentSelected(Number(assign.assignmentsId))
                  }
                  active={assignmentId === assign.assignmentsId}
                >
                  {formatDBDateToUS(assign.startDate)}
                  {" - "}
                  {formatDBDateToUS(assign.endDate)}
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Card>
        </Modal.Body>
        <Modal.Footer>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "15px", // Usar gap en lugar de manejar márgenes manuales
              width: "100%",
            }}
          >
            <Button
              variant="secondary"
              style={{ width: "150px" }}
              onClick={handleNew}
            >
              New
            </Button>
            <Button
              variant="primary"
              style={{ width: "150px" }}
              onClick={handleShowAssignment}
            >
              Show selected
            </Button>
          </div>
        </Modal.Footer>
      </Modal>

      <Modal
        show={showModalSave}
        onHide={handleCloseModalSave}
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header>
          <Modal.Title>Update assignment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <span
              style={{
                marginBottom: "10px",
                fontWeight: "bold",
                fontSize: "20px",
              }}
            >
              An assigment was selected,
              <br></br>
              What do you want to do?
            </span>

            <Button
              style={{ marginTop: "10px", fontWeight: "bold", width: "200px" }}
              onClick={() => {
                handleCloseModalSave();
                handleSubmit("update");
              }}
            >
              Update Assignment
            </Button>
            <Button
              style={{ marginTop: "10px", fontWeight: "bold", width: "200px" }}
              onClick={() => {
                handleCloseModalSave();
                handleSubmit("new");
              }}
            >
              New Assignment
            </Button>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModalSave}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default App;
