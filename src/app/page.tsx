"use client";

import "./page.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Main from "./main";

export default function Home() {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <Main />
    </QueryClientProvider>
  );
}
