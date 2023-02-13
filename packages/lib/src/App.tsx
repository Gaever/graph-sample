import { CssBaseline, ThemeProvider } from "@mui/material";
import { SnackbarProvider } from "notistack";
import React from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { AppStateProvider } from "./data-layer/app-state-provider";
import theme from "./theme";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App(props: { children: JSX.Element }) {
  // В development окружении React.StrictMode дважды монтирует дочерний узел.
  // Это приводит к багу со скрытием иконок на деве.
  // В продакшене бага нет (если иконов все еще нет, значит надо проверять наличие
  // width и height атрибутов в закодированном svg иконки).
  // На деве можно закомментировать React.StrictMode чтобы увидеть иконки.

  return (
    <React.StrictMode>
      <SnackbarProvider
        maxSnack={3}
        preventDuplicate
        hideIconVariant
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <ThemeProvider theme={theme}>
          <AppStateProvider>
            <QueryClientProvider client={queryClient}>
              <CssBaseline />
              {props.children}
            </QueryClientProvider>
          </AppStateProvider>
        </ThemeProvider>
      </SnackbarProvider>
    </React.StrictMode>
  );
}
