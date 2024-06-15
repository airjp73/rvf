import { RefObject, useEffect } from "react";

export const useNativeValidity = (
  ref: RefObject<HTMLElement & { setCustomValidity: (error: string) => void }>,
  error?: string | null,
) => {
  useEffect(() => {
    if (!ref.current) return;
    ref.current.setCustomValidity(error ?? "");
  }, [error, ref]);
};
