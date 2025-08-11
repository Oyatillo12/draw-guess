import { handleCatchChunkError } from "@/shared/utils/handleCatchChunkError";
import { lazy } from "react";

export const Lobby = lazy(() =>
  import("./Lobby")
    .then(({ Lobby }) => ({ default: Lobby }))
    .catch(handleCatchChunkError)
);

export const Room = lazy(() =>
  import("./Room")
    .then(({ Room }) => ({ default: Room }))
    .catch(handleCatchChunkError)
);
