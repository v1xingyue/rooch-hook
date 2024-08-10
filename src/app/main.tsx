"use client";

import { getRoochNodeUrl, RoochClient } from "@roochnetwork/rooch-sdk";
import { useQuery } from "@tanstack/react-query";

const useDeveloperInfo = (network: any, mypackage: string) => {
  return useQuery({
    queryKey: ["developer_info", mypackage, network],
    queryFn: async () => {
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
        return table_id;
      } else {
        console.log("No resource found");
        throw new Error("No resource found");
      }
    },
    enabled: !!mypackage && !!network,
    refetchInterval: 10000,
  });
};

const useCommits = (network: any, tableId: string | undefined) => {
  return useQuery({
    queryKey: ["commits", tableId, network],
    queryFn: async () => {
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
        return commits.data as any[];
      } else {
        return [];
      }
    },
    enabled: !!tableId && !!network,
    refetchInterval: 10000,
  });
};

export default function Main() {
  const mypackage = process.env.NEXT_PUBLIC_PACKAGE_ADDRESS;
  const network = process.env.NEXT_PUBLIC_NETWORK;
  const {
    data: tableId,
    isLoading: isLoadingTableId,
    error: tableIdError,
  } = useDeveloperInfo(network, mypackage as string);

  const {
    data: commits,
    isLoading: isLoadingCommits,
    error: commitsError,
  } = useCommits(network, tableId);

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
                  <td>{decode_value.repo_url}</td>
                  <td>{decode_value.commit_user}</td>
                </tr>
              );
            })}
        </table>
      </div>
    </main>
  );
}
