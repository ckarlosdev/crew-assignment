import { TouchBackend } from "react-dnd-touch-backend";
import { HTML5Backend } from "react-dnd-html5-backend";

export const dndMultiBackendConfig = {
  backends: [
    {
      backend: TouchBackend,
      options: {
        enableMouseEvents: true,
        delayTouchStart: 200,
        scrollAngleMoveThreshold: 5,
      },
      preview: true,
    },
    {
      backend: HTML5Backend,
      options: { enableMonitor: true },
      preview: false,
    },
  ],
};
