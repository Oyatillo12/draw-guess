import { createBrowserRouter } from "react-router-dom";
import { Suspense } from "react";
import { Lobby, Room } from "@/pages/lazy";
import { Loading } from "@/shared/components";

export const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <Suspense fallback={<Loading />}>
        <Lobby />
      </Suspense>
    ),
  },
  {
    path: "/room/:code",
    element: (
      <Suspense fallback={<Loading />}>
        <Room />
      </Suspense>
    ),
  },
]);
