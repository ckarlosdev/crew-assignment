// src/CustomDragLayer.tsx
import { useDragLayer } from "react-dnd";
import { ItemTypes, JobItem, JobItemProps } from "./JobItem";

const layerStyles: React.CSSProperties = {
  position: "fixed",
  pointerEvents: "none",
  zIndex: 100,
  left: 0,
  top: 0,
  width: "100%",
  height: "100%",
};

function getItemStyles(currentOffset: any): React.CSSProperties {
  if (!currentOffset) {
    return { display: "none" };
  }

  // Obtiene la posición actual del cursor (x, y)
  let { x, y } = currentOffset;

  // Ajuste opcional para centrar el fantasma (ajústalo si es necesario)
  // x -= 50;
  // y -= 15;

  const transform = `translate(${x}px, ${y}px)`;
  return {
    transform,
    WebkitTransform: transform,
  };
}

export const CustomDragLayer: React.FC = () => {
  const { isDragging, item, itemType, currentOffset } = useDragLayer(
    (monitor) => ({
      item: monitor.getItem(),
      itemType: monitor.getItemType(),
      // initialOffset: monitor.getInitialClientOffset(), // No se usa si solo usamos currentOffset
      currentOffset: monitor.getClientOffset(),
      isDragging: monitor.isDragging(),
    })
  );

  function renderItem() {
    switch (itemType) {
      case ItemTypes.JOB:
        // Renderiza el JobItem utilizando los datos capturados (item)
        // y le pasa isDraggingPreview: true para que sepa que es el fantasma.
        return <JobItem {...(item as JobItemProps)} isDraggingPreview={true} />;
      default:
        return null;
    }
  }

  if (!isDragging || !currentOffset) {
    return null;
  }

  return (
    <div style={layerStyles}>
      <div style={getItemStyles(null)}>{renderItem()}</div>
    </div>
  );
};
