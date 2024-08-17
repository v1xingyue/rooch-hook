"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Main from "./main";

export default function Home({ params }: { params: { table_id: string } }) {
  const { table_id } = params;
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <Main table_id={table_id} />
    </QueryClientProvider>
  );
}
