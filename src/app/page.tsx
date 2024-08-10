"use client";

import { useEffect, useState } from "react";
import { getRoochNodeUrl, RoochClient } from "@roochnetwork/rooch-sdk";
import "./page.css";

export default function Home() {
  const mypackage = process.env.NEXT_PUBLIC_PACKAGE_ADDRESS;
  const network = process.env.NEXT_PUBLIC_NETWORK;

  const [tableId, setTableId] = useState("");
  const [commits, setCommits] = useState<any[]>([]);

  useEffect(() => {
    const loadCommits = async () => {
      const client = new RoochClient({
        url: getRoochNodeUrl(network as any),
      });

      const resource = await client.getStates({
        accessPath: `/resource/${mypackage}/${mypackage}::developer::DeveloperInfo`,
        stateOption: {
          decode: true,
        },
      });

      console.log(resource);

      if (resource.length > 0) {
        const v = resource[0].decoded_value?.value.value as any;
        let table_id = v.value.commits.value.contents.value.handle.value
          .id as string;
        setTableId(table_id);
      } else {
        console.log("No resource found");
      }
    };
    loadCommits();
  }, [mypackage, network]);

  useEffect(() => {
    const loadCommits = async () => {
      if (tableId) {
        const client = new RoochClient({
          url: getRoochNodeUrl(network as any),
        });
        const commits = await client.listStates({
          accessPath: `/table/${tableId}`,
          stateOption: {
            decode: true,
            showDisplay: false,
          },
        });
        console.log(JSON.stringify(commits.data, null, 2));
        setCommits(commits.data as any[]);
      }
    };
    loadCommits();
  }, [tableId, network]);

  return (
    <main className="main">
      <h3>
        Github Commit List: {mypackage} on {network}
      </h3>
      <div>
        <p>Table ID : {tableId}</p>
        <table>
          <tr>
            <td>Commit time </td>
            <td>Commit url </td>
            <td>Commit message </td>
            <td>Commit repo_url </td>
          </tr>
          {commits.map((commit) => {
            let decode_value = commit.state.decoded_value.value.value.value;
            return (
              <tr key={commit.field_key}>
                <td>{decode_value.commit_time}</td>
                <td>{decode_value.commit_url}</td>
                <td>{decode_value.message}</td>
                <td>{decode_value.repo_url}</td>
              </tr>
            );
          })}
        </table>
      </div>
    </main>
  );
}
