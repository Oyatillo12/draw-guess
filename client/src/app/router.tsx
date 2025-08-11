import { Room } from "@/pages/Room";
import { Lobby } from "@/pages/Lobby";
import { createBrowserRouter } from "react-router-dom";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Lobby />,
    errorElement: <div>Error</div>,
  },
  {
    path: "/room/:code",
    element: <Room />,
  },
]);
