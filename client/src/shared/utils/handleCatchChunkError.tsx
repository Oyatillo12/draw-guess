import { Loading } from "../components";

export const handleCatchChunkError = () => {
  window.location.reload();

  return { default: Loading };
};
