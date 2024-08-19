"use client";

import { DataGrid } from "@mui/x-data-grid";

import Link from "next/link";
import useRepos from "./hooks/repos";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import useRoochTableData from "./hooks/tables";

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
  } = useRoochTableData("repos-list", network, tableID);

  return (
    <main className="main">
      <h3>
        Github Commit List: {mypackage} on {network}
      </h3>
      <p>TableID : {tableID}</p>
      <div>
        {repos && (
          <DataGrid
            sx={{ width: "100%" }}
            rows={repos.map((repo) => {
              let decode_value = repo.state.decoded_value.value.value.value;
              return {
                id: repo.field_key,
                repo_name: decode_value.repo_name,
                owner: decode_value.owner,
                link: `commits/${decode_value.commits.value.contents.value.handle.value.id}`,
              };
            })}
            columns={[
              { field: "repo_name", headerName: "Repo name", flex: 1 },
              { field: "owner", headerName: "Repo owner", flex: 2 },
              {
                field: "link",
                headerName: "Link",
                flex: 1,
                renderCell: (params) => (
                  <a
                    href={params.value}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Commits
                  </a>
                ),
              },
            ]}
            autoHeight
            disableRowSelectionOnClick
          />
        )}
      </div>
    </main>
  );
}
