"use client";

import { getRoochNodeUrl, RoochClient } from "@roochnetwork/rooch-sdk";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

const useRepos = (network: any, mypackage: string) => {
  return useQuery({
    queryKey: ["repos_info", mypackage, network],
    queryFn: async () => {
      const client = new RoochClient({
        url: getRoochNodeUrl(network as any),
      });

      const resource = await client.getStates({
        accessPath: `/resource/${mypackage}/${mypackage}::developer::Repos`,
        stateOption: {
          decode: true,
        },
      });

      if (resource.length > 0) {
        const v = resource[0].decoded_value?.value.value as any;
        let table_id = v.value.repos.value.handle.value.id as string;
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

const useReposList = (network: any, tableId: string | undefined) => {
  return useQuery({
    queryKey: ["repos", tableId, network],
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
    data: tableID,
    isLoading: isLoadingTableId,
    error: tableIdError,
  } = useRepos(network, mypackage as string);

  const {
    data: repos,
    isLoading: isLoadingCommits,
    error: commitsError,
  } = useReposList(network, tableID);

  return (
    <main className="main">
      <h3>
        Github Commit List: {mypackage} on {network}
      </h3>
      <p>TableID : {tableID}</p>
      <div>
        <table>
          <tr>
            <td>Repo owner </td>
            <td>Repo name </td>
            <td>Link</td>
          </tr>
          {repos &&
            repos.map((repo) => {
              let decode_value = repo.state.decoded_value.value.value.value;
              return (
                <tr key={repo.field_key}>
                  <td>{decode_value.owner}</td>
                  <td>{decode_value.repo_name}</td>
                  <td>
                    <Link
                      href={`commits/${decode_value.commits.value.contents.value.handle.value.id}`}
                    >
                      Commits
                    </Link>
                  </td>
                </tr>
              );
            })}
        </table>
      </div>
    </main>
  );
}
