// import React from "react";
// import { useDrop } from "react-dnd";
// // Importamos ItemTypes y Box para poder renderizar los elementos asignados como arrastrables
// import { ItemTypes, Box } from "./Box";

// // --- Interfaz de Datos ---
// interface Item {
//   id: number;
//   name: string;
// }

// // --- Interfaz de Props del Contenedor ---
// interface ContainerProps {
//   // La lista de empleados que ya han sido asignados a este job
//   assignedItems: Item[];
//   // La función que el componente padre (App) usará para actualizar el estado central
//   onDropItem: (item: Item) => void;
// }

// export const Container: React.FC<ContainerProps> = ({
//   onDropItem,
//   assignedItems,
// }) => {
//   // 1. Hook useDrop: Define el objetivo de soltado
//   const [{ isOver }, drop] = useDrop(() => ({
//     accept: ItemTypes.EMPLOYEE, // Solo acepta items de tipo EMPLOYEE
//     drop: (item: Item) => {
//       // Al soltar, llama a la función de asignación del App (handleAssign)
//       onDropItem(item);
//     },
//     collect: (monitor) => ({
//       // true si un elemento arrastrable está sobre esta área
//       isOver: monitor.isOver(),
//     }),
//   }));

//   // --- Estilos ---
//   const containerStyle: React.CSSProperties = {
//     width: "450px",
//     minHeight: "200px",
//     border: isOver ? "3px solid green" : "2px dashed gray",
//     backgroundColor: isOver ? "#e6ffe6" : "#f0f0f0",
//     padding: "10px",
//     marginTop: "20px",
//     borderRadius: "8px",
//   };

//   return (
//     // 2. Adjuntar la referencia 'drop' al elemento DOM
//     <div ref={drop} style={containerStyle}>
//       <h3 style={{ margin: "0 0 10px 0" }}>Job Asignado: Developer Senior</h3>
//       <p style={{ fontWeight: "bold" }}>
//         Empleados Asignados (Arrastrables hacia afuera):
//       </p>

//       {assignedItems.length === 0 && (
//         <p style={{ color: "gray" }}>
//           Arrastra un empleado aquí para asignarlo.
//         </p>
//       )}

//       {/* 3. Renderizar los empleados asignados (que ahora también son arrastrables) */}
//       <div style={{ display: "flex", flexWrap: "wrap" }}>
//         {assignedItems.map((item) => (
//           // Reutilizamos el componente Box. Como Box tiene useDrag(),
//           // este elemento es arrastrable FUERA del contenedor.
//           <Box
//             key={item.id}
//             id={item.id}
//             name={item.name}
//             // Opcional: podrías pasar un prop isAssigned para cambiar su estilo si quieres
//           />
//         ))}
//       </div>
//     </div>
//   );
// };
