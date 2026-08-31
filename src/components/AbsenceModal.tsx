import { Button, FloatingLabel, Form, Modal } from "react-bootstrap";
import { useAbsenceStore } from "../store/useAbsenceStore";

type Props = {};

function AbsenceModal({}: Props) {
  const {
    showModal,
    setShowModal,
    employeeIdSelected,
    employeeNameSelected,
    absenceData,
    setAbsenceData,
    addAbsence,
  } = useAbsenceStore();

  const handleSave = () => {
    if (!validData()) return;

    const payload = {
      ...absenceData,
      temporalId: crypto.randomUUID(),
      employeesId: employeeIdSelected,
    };

    addAbsence(payload);
    setShowModal(false);
  };

  const validData = () => {
    if (absenceData.absenceType === "") {
      alert("Absence type is missing");
      return false;
    }

    if (absenceData.absenceType === "Other" && absenceData.comments === "") {
      alert("Please add comments.");
      return false;
    }
    return true;
  };

  return (
    <>
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Absence</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <FloatingLabel
            controlId="floatingTextarea"
            label="Employee"
            className="mb-3"
          >
            <Form.Control
              type="text"
              style={{ fontWeight: "bold", textAlign: "center" }}
              value={employeeNameSelected ?? "No selected"}
              readOnly
            />
          </FloatingLabel>
          <FloatingLabel
            controlId="floatingTextarea"
            label="Type"
            className="mb-3"
          >
            <Form.Select
              aria-label="Default select example"
              style={{ fontWeight: "bold", textAlign: "center" }}
              value={absenceData.absenceType}
              onChange={(e) => {
                setAbsenceData("absenceType", e.target.value);
              }}
            >
              <option value="">Select type</option>
              <option value="Day off">Day off</option>
              <option value="Vacation">Vacation</option>
              <option value="Other">Other</option>
            </Form.Select>
          </FloatingLabel>
          <FloatingLabel
            controlId="floatingTextarea"
            label="Comment"
            className="mb-3"
          >
            <Form.Control
              as="textarea"
              style={{ fontWeight: "bold", textAlign: "center" }}
              value={absenceData.comments}
              onChange={(e) => setAbsenceData("comments", e.target.value)}
            />
          </FloatingLabel>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={() => handleSave()}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default AbsenceModal;
