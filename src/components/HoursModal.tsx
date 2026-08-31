import { Button, Col, Modal, Row } from "react-bootstrap";
import { useHourStore } from "../store/useHourStore";
import type { Employee, EmployeeData, Hours } from "../types";
import { useEffect, useMemo, useState } from "react";

type Props = {
  employees: EmployeeData[];
  hours: Hours[] | undefined;
  startDate: string | null;
};

function HoursModal({ employees, hours, startDate }: Props) {
  const { showHourModal, setShowHourModal } = useHourStore();
  const [weekRange, setWeekRange] = useState({
    start: "MM/DD/YYYY",
    end: "MM/DD/YYYY",
  });

  const employeesFiltered = useMemo(() => {
    const empFiltered = employees.filter(
      (employee) =>
        (employee.title === "Labor" || employee.title === "Supervisor") &&
        employee.status !== "Terminated",
    );

    const sortedEmployees = empFiltered.sort((a, b) => {
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
  }, [employees]);

  useEffect(() => {
    if (startDate) {
      const date = new Date(startDate + "T00:00:00");
      const dayOfWeek = date.getDay();

      const start = new Date(date);
      start.setDate(date.getDate() - dayOfWeek);

      const end = new Date(date);
      end.setDate(date.getDate() + (6 - dayOfWeek));

      // Formateador para mostrar en la UI (MM/DD/YYYY)
      const formatForUI = (d: Date) => {
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        return `${month}/${day}/${d.getFullYear()}`;
      };

      setWeekRange({
        start: formatForUI(start),
        end: formatForUI(end),
      });
    }
  }, [startDate]);

  return (
    <>
      <Modal show={showHourModal} onHide={() => setShowHourModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title className="w-100 text-center">Hours</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="bg-light rounded-3 p-3 mb-3 border-0 shadow-sm">
            <Row className="align-items-center">
              {/* Columna Foreman */}
              <Col sm={6} className="border-end-sm">
                <div className="d-flex align-items-center px-2">
                  <div className="text-primary opacity-75 me-3">
                    <i
                      className="bi bi-person-badge"
                      style={{ fontSize: "1.2rem" }}
                    ></i>
                  </div>
                  <div>
                    <div
                      className="text-uppercase text-muted fw-bold"
                      style={{
                        fontSize: "0.65rem",
                        letterSpacing: "0.05em",
                      }}
                    >
                      Week start
                    </div>
                    <div className="fw-semibold text-dark">
                      {weekRange.start}
                    </div>
                  </div>
                </div>
              </Col>

              {/* Columna Date */}
              <Col sm={6}>
                <div className="d-flex align-items-center px-2 mt-3 mt-sm-0">
                  <div className="text-primary opacity-75 me-3">
                    <i
                      className="bi bi-calendar3"
                      style={{ fontSize: "1.2rem" }}
                    ></i>
                  </div>
                  <div>
                    <div
                      className="text-uppercase text-muted fw-bold"
                      style={{
                        fontSize: "0.65rem",
                        letterSpacing: "0.05em",
                      }}
                    >
                      Week End
                    </div>
                    <div className="fw-semibold text-dark">{weekRange.end}</div>
                  </div>
                </div>
              </Col>
            </Row>
          </div>
          {/* Contenedor Principal con altura fija */}
          <div
            style={{
              maxHeight: "500px", // Ajusta esta altura según tu espacio en pantalla
              overflowY: "auto",
              overflowX: "hidden",
              paddingRight: "8px", // Espacio para que el scroll no tape el contenido
              scrollbarWidth: "thin", // Para Firefox
              scrollbarColor: "#cbd5e0 #f7fafc", // Para Firefox
            }}
            className="custom-scroll-container"
          >
            <div className="d-flex flex-column gap-2">
              {employeesFiltered.map((employee) => {
                const empHrs = (Array.isArray(hours) ? hours : []).find(
                  (h) => h.employeesId === employee.id,
                );
                const total = empHrs?.totalHrs ?? 0;

                return (
                  <div
                    key={employee.id}
                    className="d-flex align-items-center justify-content-between p-2"
                    style={{
                      backgroundColor: "#fff",
                      borderRadius: "10px",
                      border: "1px solid #edf2f7",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                    }}
                  >
                    {/* Info Empleado */}
                    <div className="d-flex align-items-center">
                      <div
                        className="rounded-circle d-flex align-items-center justify-content-center bg-primary text-white fw-bold"
                        style={{
                          width: "38px",
                          height: "38px",
                          fontSize: "0.85rem",
                          boxShadow: "0 2px 4px rgba(37, 99, 235, 0.2)",
                        }}
                      >
                        {employee.name.charAt(0)}
                      </div>
                      <div className="ms-3">
                        <div
                          className="fw-semibold text-dark"
                          style={{ lineHeight: "1.2" }}
                        >
                          {employee.name}
                        </div>
                        <small className="text-muted"> {employee.title}</small>
                      </div>
                    </div>

                    {/* Horas */}
                    <div className="text-end">
                      <div
                        className="fw-bold text-primary"
                        style={{ fontSize: "1.1rem" }}
                      >
                        {total}
                        <span
                          className="text-muted fw-normal ms-1"
                          style={{ fontSize: "0.8rem" }}
                        >
                          hrs
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowHourModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default HoursModal;
