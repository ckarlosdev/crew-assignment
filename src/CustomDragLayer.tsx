// src/CustomDragLayer.tsx

import React from "react";
import { useDragLayer } from "react-dnd";
import { EmployeeItem } from "./components/EmployeeItem";
import { JobItem } from "./components/JobItem";
import { Job } from "./types";

// Estilo para posicionar el ghost
const layerStyles: React.CSSProperties = {
  position: "fixed",
  pointerEvents: "none",
  zIndex: 1000,
  left: 0,
  top: 0,
  width: "100%",
  height: "100%",
};

export const CustomDragLayer: React.FC = () => {
  const { itemType, isDragging, item, currentOffset } = useDragLayer(
    (monitor) => ({
      item: monitor.getItem(), // Los datos del elemento arrastrado (id, name, etc.)
      itemType: monitor.getItemType(), // El tipo de elemento ('job' o 'employee')
      currentOffset: monitor.getClientOffset(), // Posición actual del cursor
      isDragging: monitor.isDragging(), // true si algo se está arrastrando
    })
  );

  if (!isDragging || !currentOffset) {
    return null;
  }

  const { x, y } = currentOffset;
  const transform = `translate(${x}px, ${y}px)`;

  // Esta es la representación visual (el ghost) que sigue al cursor
  const renderItem = () => {
    const draggedItem = item as any;
    // Podrías tener lógica para renderizar JobItem o EmployeeItem aquí
    if (itemType === "employee") {
      return (
        <EmployeeItem
          id={draggedItem.id}
          name={draggedItem.name}
          isDraggingPreview={true}
          title={draggedItem.title}
        />
      );
    }
    // ... lógica para JobItem si la necesitas ...
    if (itemType === "job") {
      const tempJob: Job = {
        id: draggedItem.id,
        title: draggedItem.title,
        number: draggedItem.number,
        assignedEmployeeIds: [],
      };

      return (
        <JobItem
          job={tempJob} // <-- Usa el objeto simulado o busca el objeto completo
          isActive={false}
          isDraggingPreview={true} // <-- Nuevo prop que debes añadir a JobItemProps
        />
      );
    }
    return null;
  };

  return (
    <div style={layerStyles}>
      <div style={{ transform }}>{renderItem()}</div>
    </div>
  );
};
