"use client";

import useRoochTableData from "@/app/hooks/tables";

export default function Main({ table_id }: { table_id: string }) {
  const mypackage = process.env.NEXT_PUBLIC_PACKAGE_ADDRESS;
  const network = process.env.NEXT_PUBLIC_NETWORK;

  console.log("table_id", table_id);

  const {
    data: commits,
    isLoading: isLoadingCommits,
    error: commitsError,
  } = useRoochTableData("commits-list", network, table_id as string);

  return (
    <main className="main">
      <h3>
        Github Commit List: {mypackage} on {network}
      </h3>
      <p>Commit TableID : {table_id}</p>
      <div>
        <table>
          <tr>
            <td>Commit time </td>
            <td>Commit url </td>
            <td>Commit message </td>
            <td>Commit address </td>
            <td>Commit username </td>
          </tr>
          {commits &&
            commits.map((commit) => {
              let decode_value = commit.state.decoded_value.value.value.value;
              return (
                <tr key={commit.field_key}>
                  <td>{decode_value.commit_time}</td>
                  <td>{decode_value.commit_url}</td>
                  <td>{decode_value.message}</td>
                  <td>{decode_value.commit_address}</td>
                  <td>{decode_value.commit_user}</td>
                </tr>
              );
            })}
        </table>
      </div>
    </main>
  );
}
