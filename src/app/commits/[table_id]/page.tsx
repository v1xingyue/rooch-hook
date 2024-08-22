"use client";

import { shortAddress } from "@/app/components/util";
import useRoochTableData from "@/app/hooks/tables";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";

export default function Home({ params }: { params: { table_id: string } }) {
  const { table_id } = params;

  const mypackage = process.env.NEXT_PUBLIC_PACKAGE_ADDRESS;
  const network = process.env.NEXT_PUBLIC_NETWORK;

  console.log("table_id", table_id);

  const {
    data: commits,
    isLoading: isLoadingCommits,
    error: commitsError,
  } = useRoochTableData("commits-list", network, table_id as string);
  return (
    <>
      <h3>
        Github Commit List: {mypackage} on {network}
      </h3>
      <p>Commit TableID : {table_id}</p>
      <div>
        {commits && (
          <DataGrid
            pageSizeOptions={[10, 25, 50, 100]}
            initialState={{
              sorting: {
                sortModel: [
                  {
                    field: "commit_time",
                    sort: "desc",
                  },
                ],
              },
            }}
            sx={{ width: "100%" }}
            rows={commits.map((commit) => {
              let decode_value = commit.state.decoded_value.value.value.value;
              return {
                id: commit.field_key,
                commit_time: decode_value.commit_time,
                message: decode_value.message,
                commit_address: shortAddress(decode_value.commit_address),
                commit_url: decode_value.commit_url,
              };
            })}
            columns={[
              {
                field: "commit_time",
                headerName: "Commit time",
                flex: 1,
                sortable: true,
              },
              { field: "message", headerName: "Commit message", flex: 2 },
              {
                field: "commit_address",
                headerName: "Commit address",
                flex: 1,
              },
              {
                field: "commit_url",
                headerName: "Commit Link",
                flex: 1,
                renderCell: (params) => (
                  <a
                    href={params.value}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Github
                  </a>
                ),
              },
            ]}
            autoHeight
            disableRowSelectionOnClick
          />
        )}
      </div>
    </>
  );
}
