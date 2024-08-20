import { Container } from "@mui/material";
import type { Metadata } from "next";
import AppWrapper from "./components/AppWrapper";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const metadata: Metadata = {
  title: "Rooch Hook --- Collect Github Events With Rooch",
  description: "Collect Github Events With Rooch",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Container
          sx={{
            padding: "2rem",
          }}
          maxWidth={"xl"}
        >
          <AppWrapper>{children}</AppWrapper>
        </Container>
        <ToastContainer />
      </body>
    </html>
  );
}
