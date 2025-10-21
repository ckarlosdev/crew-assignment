// CustomDragLayer.tsx
import React from "react";
import { useDragLayer } from "react-dnd";
import { ItemTypes } from "./JobItem"; // ajusta la ruta si es necesario

const layerRootStyle: React.CSSProperties = {
  position: "fixed",
  pointerEvents: "none",
  zIndex: 1000,
  left: 0,
  top: 0,
  width: "100%",
  height: "100%",
};

const previewStyle = (x: number, y: number): React.CSSProperties => ({
  transform: `translate(${x}px, ${y}px)`,
  WebkitTransform: `translate(${x}px, ${y}px)`,
});

export const CustomDragLayer: React.FC = () => {
  const { itemType, isDragging, item, currentOffset } = useDragLayer(
    (monitor) => ({
      item: monitor.getItem(),
      itemType: monitor.getItemType(),
      isDragging: monitor.isDragging(),
      currentOffset: monitor.getClientOffset(),
    })
  );

  if (!isDragging || !currentOffset || itemType !== ItemTypes.JOB) {
    return null;
  }

  // los valores pueden venir como undefined; protegemos la renderización
  const number = item?.number ?? "...";
  const title = item?.title ?? "Cargando...";
  const assigned = item?.assigned ?? "...";
  const isActive = item?.isActive ?? false;

  // ajusta el offset para centrar el preview respecto al cursor si quieres
  const x = currentOffset.x + 8;
  const y = currentOffset.y + 8;

  return (
    <div style={layerRootStyle}>
      <div style={previewStyle(x, y)}>
        <div
          style={{
            padding: "8px 12px",
            borderRadius: 8,
            backgroundColor: isActive ? "#f7b731" : "#ffeaa7",
            border: isActive ? "2px solid #e17055" : "1px solid #fdcb6e",
            boxShadow: "0 6px 18px rgba(0,0,0,0.15)",
            display: "inline-block",
            minWidth: 160,
            fontFamily: "Arial, sans-serif",
            fontSize: 14,
            color: "#2d3436",
          }}
        >
          <div style={{ fontWeight: "700" }}>
            #{number} {title}
          </div>
          <div style={{ marginTop: 4, fontSize: 12, opacity: 0.9 }}>
            ({assigned})
          </div>
        </div>
      </div>
    </div>
  );
};
