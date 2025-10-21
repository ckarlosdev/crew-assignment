import React from "react";
import { useDrag } from "react-dnd";

interface BoxProps {
  id: number; // Añadimos el ID
  name: string;
}

export const ItemTypes = {
  EMPLOYEE: "employee", // Cambiamos el tipo a algo más descriptivo
};

export const Box: React.FC<BoxProps> = ({ id, name }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.EMPLOYEE,
    item: { id, name }, // Adjuntamos ID y Nombre al arrastre
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const boxStyle: React.CSSProperties = {
    padding: "0.5rem 1rem",
    margin: "0.5rem",
    cursor: "move",
    backgroundColor: "#ffc107", // Color diferente para destacar
    border: "1px solid #d39e00",
    borderRadius: "4px",
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div ref={drag} style={boxStyle}>
      {name}
    </div>
  );
};
