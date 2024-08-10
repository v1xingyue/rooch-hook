"use client";

import { useEffect } from "react";
import styles from "./page.module.css";

export default function Home() {
  useEffect(() => {
    console.log("page.tsx");
  });

  const mypackage = process.env.NEXT_PUBLIC_PACKAGE_ADDRESS;
  const network = process.env.NEXT_PUBLIC_NETWORK;
  return (
    <main className={styles.main}>
      <h3>
        Github Commit List: {mypackage} on {network}
      </h3>
      <div></div>
    </main>
  );
}
