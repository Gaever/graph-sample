import { useSnackbar } from "notistack";
import { useCallback } from "react";

export function errorMessage(error: any): string {
  console.error(error);
  if (error instanceof Error) {
    return error.message;
  } else if (typeof error === "string") {
    return error;
  } else if (error?.error?.message) {
    return error?.error?.message;
  } else {
    return "Неизвестная ошибка";
  }
}

export function useErrorHandler() {
  const { enqueueSnackbar } = useSnackbar();

  const errorHandler = useCallback((error: any) => {
    enqueueSnackbar(errorMessage(error), { variant: "error" });
  }, []);

  return { errorHandler };
}
