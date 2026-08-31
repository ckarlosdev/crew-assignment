import { ChangeEvent, useCallback, useEffect, useMemo, useState } from "react";
import {
  Assign,
  Assignment,
  Employee,
  EmployeeData,
  Job,
  JobData,
  type Hours,
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
import hmbLogo from "./assets/hmbLogo.png";
import {
  getEmployeesHoursURL,
  searchAssignmentsURL,
  searchAssignURL,
  searchEmployeestsURL,
  searchJobstsURL,
  submitAssignmentURL,
} from "./hooks/urls";
import {
  Accordion,
  Button,
  Card,
  Form,
  ListGroup,
  Modal,
  Pagination,
  Spinner,
} from "react-bootstrap";
import AbsenceModal from "./components/AbsenceModal";
import { useAbsenceStore } from "./store/useAbsenceStore";
import { useHourStore } from "./store/useHourStore";
import HoursModal from "./components/HoursModal";

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
  const [searchTerm, setSearchTerm] = useState("");
  const { absences, removeAbsence, fillAbsences } = useAbsenceStore();
  const { setShowHourModal } = useHourStore();

  const [employees, setEmployees] = useState<Employee[]>([]);
  const todayString = getTodayDateString();
  const [startDate, setStartDate] = useState<string | null>(todayString);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [assignmentId, setAssignmentId] = useState<number>(0);
  const [show, setShow] = useState(true);
  const [showModalSave, setShowModalSave] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchList, setSearchList] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const absencesSorted = useMemo(() => {
    return [...absences].sort((a, b) => {
      const empA = employeesDetail.find((e) => e.employeesId === a.employeesId);
      const empB = employeesDetail.find((e) => e.employeesId === b.employeesId);

      const nameA = empA?.firstName || "";
      const nameB = empB?.firstName || "";

      // 4. Comparamos los strings (orden alfabético)
      return nameA.localeCompare(nameB);
    });
  }, [absences, employeesDetail]);

  const filteredAssignments = useMemo(() => {
    return assignments.filter(
      (assign) =>
        assign.startDate.toLowerCase().includes(searchList.toLowerCase()) ||
        assign.endDate.toLowerCase().includes(searchList.toLowerCase()),
    );
  }, [assignments, searchList]);

  const totalPages = Math.ceil(filteredAssignments.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredAssignments.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );
  useEffect(() => {
    setCurrentPage(1);
  }, [searchList]);

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
    fillAbsences([]);
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

  const filteredJobsData = useMemo(() => {
    if (!jobs) return [];

    let result = [...jobs];

    if (searchTerm) {
      const lowSearch = searchTerm.toLowerCase();
      result = result.filter((job) => {
        return (
          job.number?.toLowerCase().includes(lowSearch) ||
          job.title?.toLowerCase().includes(lowSearch) ||
          job.address?.toLowerCase().includes(lowSearch)
        );
      });
    }

    return result;
  }, [jobs, searchTerm]);

  const [activeJobIds, setActiveJobIds] = useState<number[]>([]);
  const {
    postData: submitAssignment,
    putData: updateAssignment,
    loading,
  } = useHttpsData<Assignment>();

  const { data: jobsData, search: searchJobs } = useHttpsData<JobData[]>();
  const { data: assignmentsData, search: searchAssignments } =
    useHttpsData<Assignment[]>();

  const { data: assignData, search: searchAssign } = useHttpsData<Assign>();
  const { data: employeeData, search: searchEmployees } =
    useHttpsData<EmployeeData[]>();
  const { data: hours, search: searchHours } = useHttpsData<Hours[]>();

  useEffect(() => {
    const urlJobs = searchJobstsURL();
    searchJobs(urlJobs);

    const urlEmp = searchEmployeestsURL();
    searchEmployees(urlEmp);

    const urlAssig = searchAssignmentsURL();
    searchAssignments(urlAssig);
  }, []);

  useEffect(() => {
    if (startDate) {
      const date = new Date(startDate);
      const dayOfWeek = date.getDay();

      const start = new Date(date);
      start.setDate(date.getDate() - dayOfWeek);

      const end = new Date(date);
      end.setDate(date.getDate() + (6 - dayOfWeek));

      const formatDate = (d: Date) => d.toISOString().split("T")[0];

      const urlHours = getEmployeesHoursURL(formatDate(start), formatDate(end));
      searchHours(urlHours);

      // console.log("urlHours: ", urlHours, hours);
    }
  }, [startDate]);

  const handleShowAssignment = () => {
    setShow(false);
    // let assig = assignData?.find(assign => assign.assignmentsId == assignmentId);

    const urlAssigment = searchAssignURL(assignmentId);
    searchAssign(urlAssigment);
  };

  const filteredJobs = useMemo(() => {
    const sortedDescending = [...jobsDetail].sort(
      (a, b) => b.jobsId - a.jobsId,
    );
    // const lastNJobs = sortedDescending.slice(0, jobNumbers);
    const transformedJobs: Job[] = sortedDescending.map((data) => ({
      id: data.jobsId, // Map jobsId to the required id field
      title: data.name, // Map name (or another field) to title
      number: data.number,
      address: data.address,
      startTime: "07:00",
      assignmentComment: "",
      assignedEmployeeIds: [], // Initialize the assignment array as empty
    }));

    return transformedJobs;
  }, [jobsDetail]);
  // }, [jobsDetail, jobNumbers]);

  useEffect(() => {
    setJobs(filteredJobs);
  }, [filteredJobs]);

  const filteredEmployees = useMemo(() => {
    const employeesAvailables = employeesDetail.filter(
      (emp) =>
        !absences.some((absence) => absence.employeesId === emp.employeesId),
    );

    const eligibleEmployees = employeesAvailables.filter(
      (employee) =>
        (employee.title === "Labor" || employee.title === "Supervisor") &&
        employee.status !== "Terminated",
    );

    // 2. Aplicar el orden personalizado con un Custom Comparator
    const sortedEmployees = eligibleEmployees.sort((a, b) => {
      const getTitlePriority = (title: string) => {
        if (title === "Supervisor") return 1;
        if (title === "Labor") return 2;
        return 3;
      };

      const priorityA = getTitlePriority(a.title);
      const priorityB = getTitlePriority(b.title);

      if (priorityA !== priorityB) {
        return priorityA - priorityB; // Si son diferentes, ordena por prioridad (1 antes que 2)
      }

      return a.firstName.localeCompare(b.firstName);
    });

    const transformedEmployees: Employee[] = sortedEmployees.map((data) => ({
      id: data.employeesId,
      name: data.firstName + " " + data.lastName,
      title: data.title,
      status: "available",
    }));

    return transformedEmployees;
  }, [employeesDetail, absences]);

  const handleAssignmentSelected = (assignmentId: number) => {
    setAssignmentId(assignmentId);
  };

  const handleStartDateChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newStartDateString = e.target.value;
    setStartDate(newStartDateString);
  };

  useEffect(() => {
    if (assignmentId == 0) {
      const newStartDateObject = new Date(startDate + "T00:00:00");
      newStartDateObject.setDate(newStartDateObject.getDate() + 6);
      const newEndDateString = formatDateToString(newStartDateObject);
      setEndDate(newEndDateString);
    }
  }, [startDate]);

  const handleEndDateChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEndDate(e.target.value);
  };

  // useEffect(() => {
  //   setEmployees(filteredEmployees);
  // }, [filteredEmployees]);

  useEffect(() => {
    const currentlyAssignedIds = new Set(
      jobs.flatMap((job) => job.assignedEmployeeIds.map((id) => Number(id))),
    );

    const synchronizedEmployees: Employee[] = filteredEmployees.map((emp) => ({
      ...emp,
      // Forzamos a que el resultado sea tratado como el tipo específico, no un string genérico
      status: (currentlyAssignedIds.has(Number(emp.id))
        ? "assigned"
        : "available") as "assigned" | "available",
    }));

    setEmployees(synchronizedEmployees);
  }, [filteredEmployees, jobs]);

  // useEffect(() => {
  //   if (jobsData) {
  //     setJobsDetail(jobsData);
  //   }
  // }, [jobsData]);

  useEffect(() => {
    // Solo cargar si jobsDetail está vacío para evitar sobreescribir cambios locales
    if (jobsData && jobsDetail.length === 0) {
      setJobsDetail(jobsData);
    }
  }, [jobsData, jobsDetail.length]);

  useEffect(() => {
    if (employeeData) {
      setEmployeesDetail(employeeData);
    }
  }, [employeeData]);

  useEffect(() => {
    if (assignmentsData) {
      const sortedDescending = [...assignmentsData].sort(
        (a, b) => b.assignmentsId - a.assignmentsId,
      );
      setAssignments(sortedDescending);
    }
  }, [assignmentsData]);

  useEffect(() => {
    if (assignData) {
      setStartDate(assignData ? assignData?.startDate : "");
      setEndDate(assignData ? assignData?.endDate : "");
      setAssignmentId(assignData ? assignData?.assignmentsId : 0);

      if (assignData.absences) {
        fillAbsences(assignData.absences);
      }

      if (assignData.assignmentJobDtos) {
        const newJobIds: number[] = [];
        const allAssignedEmployeeIds: number[] = [];
        // const jobIds = assignData.assignmentJobDtos.map((job) => job.jobsId);

        const updatedJobs = jobs.map((appJob) => {
          const loadedJobDto = assignData.assignmentJobDtos.find(
            (dto) => dto.jobsId === appJob.id,
          );
          if (loadedJobDto) {
            newJobIds.push(appJob.id);

            const assignedIds =
              loadedJobDto.assignmentEmployeeDtos?.map(
                (emp) => emp.employeesId,
              ) || [];
            // const employeeDtos = loadedJobDto.assignmentEmployeeDtos || [];
            // const assignedIds = employeeDtos.map((emp) => emp.employeesId);
            allAssignedEmployeeIds.push(...assignedIds);
            return {
              ...appJob,
              assignedEmployeeIds: assignedIds || [],
              startTime: loadedJobDto.startTime || "",
              assignmentComment: loadedJobDto.assignmentComment || "",
            };
          }
          // if (appJob.assignedEmployeeIds.length > 0) {
          //   return {
          //     ...appJob,
          //     assignedEmployeeIds: [],
          //     startTime: "07:00",
          //     assignmentComment: "",
          //   } as Job;
          // }
          // return appJob;

          return {
            ...appJob,
            assignedEmployeeIds: [],
            startTime: "07:00",
            assignmentComment: "",
          };
        });

        // setEmployees((prevEmployees) => {
        //   return prevEmployees.map((employee) => {
        //     const isAssignedToJob = allAssignedEmployeeIds.includes(
        //       Number(employee.id),
        //     );

        //     return {
        //       ...employee,
        //       status: isAssignedToJob ? "assigned" : "available",
        //     };
        //   });
        // });

        setJobs(updatedJobs);
        setActiveJobIds(newJobIds);
      }
    }
  }, [assignData, fillAbsences]);

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
    [setEmployees, setJobs, setActiveJobIds],
  );

  const handleUpdateJob = useCallback(
    (jobId: number, changes: Partial<Job>) => {
      setJobs((prevJobs) =>
        prevJobs.map((job) =>
          job.id === jobId ? { ...job, ...changes } : job,
        ),
      );
    },
    [],
  );

  const handleAssignEmployee = useCallback(
    (employeeId: number, jobId: number) => {
      setJobs((prevJobs) => {
        return prevJobs.map((job) => {
          if (job.assignedEmployeeIds.includes(employeeId)) {
            return {
              ...job,
              assignedEmployeeIds: job.assignedEmployeeIds.filter(
                (id) => id !== employeeId,
              ),
            };
          }

          if (job.id === jobId) {
            if (!job.assignedEmployeeIds.includes(employeeId)) {
              return {
                ...job,
                assignedEmployeeIds: [...job.assignedEmployeeIds, employeeId],
              };
            }
          }

          return job;
        });
      });
      setEmployees((prevEmployees) => {
        return prevEmployees.map((employee) => {
          if (employee.id === employeeId) {
            return {
              ...employee,
              status: "assigned",
            };
          }
          return employee;
        });
      });
    },
    [],
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
              (id) => id !== employeeId,
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
        (job) => job.assignedEmployeeIds && job.assignedEmployeeIds.length > 0,
      );

      if (allHaveEmployees) {
        var data = {
          assignmentId: action === "new" ? 0 : assignmentId,
          createdBy: "pending",
          startDate: startDate,
          endDate: endDate,
          assignmentJobCreateDtoList: jobslist,
          absenceCreateDtoList: absences,
        };

        // console.log(data);

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
              return [result, ...prev];
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

  // const phoneNumber = "+523321543415";

  const fullUrl = `https://ckarlosdev.github.io/assignment-labor-view/?assigmentsId=${assignmentId}`;
  const messageText = `¡Hello! Please review the jobs assignment: (${fullUrl})`;

  const handleSendSms = () => {
    const encodedMessage = encodeURIComponent(messageText);
    // const smsLink = `sms:${phoneNumber.phone}?body=${encodedMessage}`;
    const smsLink = `sms:?body=${encodedMessage}`;
    window.location.href = smsLink;
  };

  const getPaginationItems = () => {
    const items: (number | string)[] = [];
    const neighborCount = 1; // Cuántos números mostrar a cada lado de la actual (ej: [2], 3, [4])

    // 1. Siempre incluir la primera página
    items.push(1);

    // 2. Determinar si necesitamos el primer elipsis
    if (currentPage > neighborCount + 2) {
      items.push("ellipsis1");
    }

    // 3. Calcular el rango central
    // Math.max/min aseguran que no nos salgamos de los límites (1 y totalPages)
    const start = Math.max(2, currentPage - neighborCount);
    const end = Math.min(totalPages - 1, currentPage + neighborCount);

    for (let i = start; i <= end; i++) {
      items.push(i);
    }

    // 4. Determinar si necesitamos el segundo elipsis
    if (currentPage < totalPages - neighborCount - 1) {
      items.push("ellipsis2");
    }

    // 5. Siempre incluir la última página (si hay más de una)
    if (totalPages > 1) {
      items.push(totalPages);
    }

    return items;
  };

  return (
    <>
      <DndProvider
        backend={MultiBackend as any}
        options={dndMultiBackendConfig}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center", // Centra verticalmente botones y logo
            justifyContent: "space-between", // Distribuye el espacio
            marginTop: "20px",
            marginBottom: "4px",
            padding: "0 20px", // Espaciado a los lados
          }}
        >
          {/* Contenedor Izquierdo */}
          <div style={{ flex: 1, textAlign: "left" }}>
            <Button
              variant="outline-primary"
              style={{ fontWeight: "bold" }}
              onClick={() => {
                window.location.href = `https://ckarlosdev.github.io/HMBrandt/`;
              }}
            >
              {"< "}Home
            </Button>
          </div>

          {/* Logo Central */}
          <div style={{ flex: 0 }}>
            <img
              style={{ width: "250px", display: "block" }}
              src={hmbLogo}
              alt="Logo"
            />
          </div>

          {/* Contenedor Derecho */}
          <div style={{ flex: 1, textAlign: "right" }}>
            <Button
              variant="outline-primary"
              style={{ fontWeight: "bold" }}
              // onClick={() => {
              //   window.location.href = `https://ckarlosdev.github.io/assignment-labor-view/`;
              // }}
              onClick={() => {
                window.open(
                  "https://ckarlosdev.github.io/assignment-labor-view/",
                  "_blank",
                  "noreferrer",
                );
              }}
            >
              Labor View
            </Button>
          </div>
        </div>
        <div style={{ textAlign: "center", marginBottom: "5px" }}>
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
        <div style={{ textAlign: "center", marginBottom: "10px" }}>
          <Button
            style={{
              width: "200px",
              height: "40px",
              fontWeight: "bold",
              fontSize: "18px",
              borderRadius: "10px",
            }}
            onClick={handleSendSms}
            disabled={assignmentId === 0 ? true : false}
            variant="outline-secondary"
          >
            Send SMS
          </Button>
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
            <div className="mb-2">
              <Form.Control
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <JobList
              // jobs={jobs}
              jobs={filteredJobsData}
              activeJobIds={activeJobIds}
              onJobDeactivation={handleJobDeactivation}
            />
          </div>

          <div className="assignment-container-main">
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                width: "100%",
                padding: "0 20px",
              }}
            >
              <Button
                style={{
                  width: "100px",
                  height: "40px",
                  marginBottom: "10px",
                  fontWeight: "bold",
                  fontSize: "18px",
                  borderRadius: "10px",
                }}
                onClick={handleShow}
                variant="outline-secondary"
              >
                List
              </Button>
              <h2 style={{ textAlign: "center", margin: "0" }}>
                Assignment Zone
              </h2>
              <Button
                style={{
                  width: "100px",
                  height: "40px",
                  fontWeight: "bold",
                  fontSize: "18px",
                  borderRadius: "10px",
                }}
                variant="outline-secondary"
                onClick={handleReviewId}
                disabled={!saving ? false : true}
              >
                {!saving ? "Save" : "Saving..."}
              </Button>
            </div>
            <AssignmentContainer
              jobs={jobs}
              employees={employees}
              activeJobIds={activeJobIds}
              onJobDrop={handleJobActivation}
              onAssignEmployee={handleAssignEmployee}
              onUpdateJob={handleUpdateJob}
              empHours={hours ?? []}
            />
          </div>

          <div className="employee-list-container">
            <Accordion className="mb-2">
              <Accordion.Item eventKey="0">
                <Accordion.Header>
                  <span style={{ fontWeight: "bold", color: "#ff0000" }}>
                    {absences.length > 0
                      ? "ABSENCES (" + absences.length + ")"
                      : "No Absences"}
                  </span>
                </Accordion.Header>
                <Accordion.Body className="p-0">
                  <ListGroup variant="flush">
                    {absencesSorted.map((absence) => {
                      const emp = employeesDetail.find(
                        (em) => em.employeesId === absence.employeesId,
                      );

                      const fullName = emp
                        ? `${emp.firstName} ${emp.lastName}`
                        : "Unknown";

                      const hrs = hours?.find?.(
                        (eh) => eh.employeesId === absence.employeesId,
                      );

                      return (
                        <ListGroup.Item
                          title={
                            absence.absenceType + " \n " + absence.comments
                          }
                          key={absence.temporalId}
                          className="d-flex align-items-center"
                          style={{ padding: "8px 12px" }}
                        >
                          <span style={{ fontWeight: "bold" }}>{fullName}</span>
                          {hrs?.totalHrs ?? "0"}
                          {" hrs"}
                          <Button
                            title="Remove absence"
                            variant="outline-danger"
                            style={{
                              fontWeight: "bold",
                              width: "25px",
                              height: "20px",
                              fontSize: "9px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              padding: "0",
                              marginLeft: "auto",
                            }}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              // console.log(absence.temporalId);
                              removeAbsence(absence.temporalId);
                            }}
                          >
                            X
                          </Button>
                        </ListGroup.Item>
                      );
                    })}
                  </ListGroup>
                </Accordion.Body>
              </Accordion.Item>
            </Accordion>
            <div
              className="mt-3 mb-2"
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center", // Centra el contenido principal (H5)
                minHeight: "32px",
              }}
            >
              <h5 style={{ margin: 0, fontWeight: "bold", color: "#334155" }}>
                Employees
              </h5>

              <Button
                variant="outline-primary"
                title="Hours"
                style={{
                  position: "absolute", // Lo sacamos del flujo para que no empuje al h5
                  right: "8px", // Lo pegamos a la derecha
                  width: "26px",
                  height: "26px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "16px",
                  padding: "0",
                  lineHeight: "1",
                  borderWidth: "1.5px",
                }}
                onClick={() => setShowHourModal(true)}
              >
                🕐
              </Button>
            </div>
            <EmployeeList
              employees={employees}
              onUnassignEmployee={handleUnassignEmployee}
              empHours={hours ?? []}
            />
          </div>
        </div>
      </DndProvider>

      {loading && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(255, 255, 255, 0.7)",
            zIndex: 9999,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Spinner
            animation="border"
            variant="primary"
            style={{ width: "4rem", height: "4rem" }}
          />
          <h4 className="mt-3">Saving Report...</h4>
        </div>
      )}

      <Modal
        show={show}
        onHide={handleClose}
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header closeButton>
          <Modal.Title className="w-100 text-center">
            Assignments created
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Control
            placeholder="Search by date..."
            onChange={(e) => setSearchList(e.target.value)}
            className="mb-3"
            style={{ textAlign: "center" }}
          />
          <Card>
            <ListGroup style={{ maxHeight: "400px", overflowY: "auto" }}>
              {currentItems.map((assign) => (
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
          {totalPages > 1 && (
            <div className="d-flex justify-content-center mt-3">
              <Pagination size="sm" className="mb-0">
                <Pagination.First
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                />
                <Pagination.Prev
                  onClick={() => setCurrentPage((prev) => prev - 1)}
                  disabled={currentPage === 1}
                />

                {getPaginationItems().map((item, index) => {
                  if (item === "ellipsis1" || item === "ellipsis2") {
                    return (
                      <Pagination.Ellipsis key={`ellipsis-${index}`} disabled />
                    );
                  }

                  return (
                    <Pagination.Item
                      key={item}
                      active={item === currentPage}
                      onClick={() => setCurrentPage(Number(item))}
                    >
                      {item}
                    </Pagination.Item>
                  );
                })}

                <Pagination.Next
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                  disabled={currentPage === totalPages}
                />
                <Pagination.Last
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                />
              </Pagination>
            </div>
          )}
          <p className="text-center text-muted small mt-2">
            Page {currentPage} of {totalPages} ({assignments.length} total)
          </p>
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

      <AbsenceModal />
      <HoursModal employees={employeesDetail} hours={hours ?? []} startDate={startDate} />
    </>
  );
}

export default App;
