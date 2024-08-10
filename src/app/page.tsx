import styles from "./page.module.css";

export default function Home() {
  const mypackage = process.env.PACKAGE_ADDRESS;
  const network = process.env.NETWORK;
  return (
    <main className={styles.main}>
      <h3>
        Github Commit List: {mypackage} on {network}
      </h3>
      <div></div>
    </main>
  );
}
