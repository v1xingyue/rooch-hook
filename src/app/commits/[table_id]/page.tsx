"use client";

import AppWrapper from "@/app/components/AppWrapper";
import Main from "./main";

export default function Home({ params }: { params: { table_id: string } }) {
  const { table_id } = params;
  return (
    <AppWrapper>
      <Main table_id={table_id} />
    </AppWrapper>
  );
}
