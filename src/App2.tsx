// import { DndProvider, useDrop } from "react-dnd";
// import { HTML5Backend } from "react-dnd-html5-backend";
// import { Box, ItemTypes } from "./components/Box";
// import { Container } from "./components/Container";
// import { useCallback, useState } from "react";

// interface Item {
//   id: number;
//   name: string;
// }

// const initialEmployees: Item[] = [
//   { id: 1, name: "Alice - Disponible" },
//   { id: 2, name: "Bob - Disponible" },
//   { id: 3, name: "Charlie - Disponible" },
// ];

// // --- ZONA DE DESASIGNACIÓN ---
// const AvailableEmployeesDropZone: React.FC<{
//   availableItems: Item[];
//   onDropItem: (item: Item) => void;
// }> = ({ availableItems, onDropItem }) => {
//   // Configuramos useDrop para aceptar el arrastre y ejecutar la desasignación
//   const [{ isOver }, drop] = useDrop(() => ({
//     accept: ItemTypes.EMPLOYEE,
//     drop: (item: Item) => {
//       onDropItem(item); // Llama a la lógica de desasignación
//     },
//     collect: (monitor) => ({
//       isOver: monitor.isOver(),
//     }),
//   }));

//   const style: React.CSSProperties = {
//     minHeight: "50px",
//     border: isOver ? "3px solid orange" : "1px solid #ccc",
//     backgroundColor: isOver ? "#fff3e0" : "white",
//     padding: "10px",
//     display: "flex",
//     flexWrap: "wrap",
//     marginBottom: "20px",
//     width: "450px", // Aseguramos el mismo ancho que el contenedor
//   };

//   return (
//     <div ref={drop} style={style}>
//       {availableItems.length === 0 && (
//         <p style={{ color: "gray" }}>No hay empleados disponibles.</p>
//       )}
//       {availableItems.map((item) => (
//         <Box key={item.id} id={item.id} name={item.name} />
//       ))}
//       {isOver && (
//         <div
//           style={{ position: "absolute", color: "orange", fontSize: "0.8rem" }}
//         >
//           SUELTA para desasignar
//         </div>
//       )}
//     </div>
//   );
// };

// function App() {
//   const [availableItems, setAvailableItems] = useState(initialEmployees);
//   const [assignedItems, setAssignedItems] = useState<Item[]>([]);

//   // LÓGICA DE ASIGNACIÓN (Mover de Available a Assigned)
//   const handleAssign = useCallback((item: Item) => {
//     let shouldAdd = false;

//     // Usar la forma funcional del setter para verificar el estado actual
//     setAssignedItems((prevAssigned) => {
//       const isAlreadyAssigned = prevAssigned.some((e) => e.id === item.id);

//       if (!isAlreadyAssigned) {
//         shouldAdd = true; // Marcamos que debe continuar
//         return [
//           ...prevAssigned,
//           { id: item.id, name: item.name.replace("Disponible", "Asignado") },
//         ];
//       }
//       return prevAssigned; // Devolver el estado sin cambios si ya existe
//     });

//     // Si el elemento fue añadido (no era un duplicado), lo quitamos de disponibles
//     if (shouldAdd) {
//       setAvailableItems((prevAvailable) =>
//         prevAvailable.filter((e) => e.id !== item.id)
//       );
//     }
//   }, []);

//   // LÓGICA DE DESASIGNACIÓN (Mover de Assigned a Available)
//   const handleUnassign = useCallback((item: Item) => {
//     // 1. Eliminar de la lista de asignados
//     setAssignedItems((prevAssigned) =>
//       prevAssigned.filter((e) => e.id !== item.id)
//     );
//     // 2. Agregar a la lista de disponibles, asegurando el estado original
//     setAvailableItems((prevAvailable) =>
//       [
//         ...prevAvailable,
//         { id: item.id, name: item.name.replace("Asignado", "Disponible") },
//       ].sort((a, b) => a.id - b.id)
//     ); // Opcional: ordenar por ID
//   }, []);

//   return (
//     <DndProvider backend={HTML5Backend}>
//       <div
//         className="App"
//         style={
//           {
//             /* ... estilos ... */
//           }
//         }
//       >
//         <h1>Asignación Dinámica de Empleados (Bidireccional)</h1>

//         <h2>Empleados Disponibles (Zona de Desasignación)</h2>
//         {/* Usamos el nuevo componente de Zona de Soltado, pasándole la función de desasignación */}
//         <AvailableEmployeesDropZone
//           availableItems={availableItems}
//           onDropItem={handleUnassign}
//         />

//         <h2>Contenedor de Job (Objetivo de Asignación)</h2>
//         {/* El Container sigue llamando a la función de asignación */}
//         <Container onDropItem={handleAssign} assignedItems={assignedItems} />
//       </div>
//     </DndProvider>
//   );
// }

// export default App;
