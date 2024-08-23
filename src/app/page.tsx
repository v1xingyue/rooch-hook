"use client";

import { DataGrid } from "@mui/x-data-grid";
import useRepos from "./hooks/repos";
import useRoochTableData from "./hooks/tables";
import DeveloperInfo from "./components/DeveloperInfo";
import {
  useCurrentAddress,
  UseSignAndExecuteTransaction,
} from "@roochnetwork/rooch-sdk-kit";
import React from "react";
import { CreateRepoDialog } from "./dialogs/createRepo";
import { Chip, Paper, Typography } from "@mui/material";

export default function Main() {
  const address = useCurrentAddress();
  const mypackage = process.env.NEXT_PUBLIC_PACKAGE_ADDRESS;
  const network = process.env.NEXT_PUBLIC_NETWORK;
  const {
    data: tableID,
    isLoading: isLoadingTableId,
    error: tableIdError,
  } = useRepos(network, mypackage as string);
  const { mutateAsync: signAndExecuteTransaction } =
    UseSignAndExecuteTransaction();

  const {
    data: repos,
    isLoading: isLoadingCommits,
    error: commitsError,
  } = useRoochTableData("repos-list", network, tableID);

  return (
    <main className="main">
      <Paper sx={{ padding: "1rem", margin: "1rem" }}>
        <Typography>
          <p>Contract: {mypackage}</p>
          <p>Rooch Address : {address?.genRoochAddress().toHexAddress()}</p>
        </Typography>
      </Paper>
      <div>
        <DeveloperInfo />
        <div
          style={{
            marginBottom: "1rem",
            float: "right",
          }}
        >
          <CreateRepoDialog />
        </div>

        {repos && (
          <DataGrid
            sx={{ width: "100%" }}
            rows={repos.map((repo) => {
              let decode_value = repo.state.decoded_value.value.value.value;
              return {
                id: repo.field_key,
                repo_name: decode_value,
                repo_url: decode_value.repo_url,
                owner: decode_value.owner,
                link: `commits/${decode_value.commits.value.contents.value.handle.value.id}`,
              };
            })}
            columns={[
              {
                field: "repo_name",
                headerName: "Repo name",
                flex: 1,
                renderCell: (params) => (
                  <a
                    href={params.value.repo_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {params.value.repo_name}
                  </a>
                ),
              },
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
