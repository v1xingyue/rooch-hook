"use client";

import { DataGrid } from "@mui/x-data-grid";
import useRepos from "./hooks/repos";
import useRoochTableData from "./hooks/tables";
import DeveloperInfo from "./components/DeveloperInfo";
import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/Add";
import { Transaction } from "@roochnetwork/rooch-sdk";
import {
  useCurrentSession,
  UseSignAndExecuteTransaction,
} from "@roochnetwork/rooch-sdk-kit";
import { toast } from "react-toastify"; // Add this import

export default function Main() {
  const session = useCurrentSession();
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

  const handleCreateRepo = async () => {
    if (session) {
      const txn = new Transaction();
      txn.callFunction({
        function: "create_repo",
        module: "",
        address: "",
        args: [],
        typeArgs: [],
      });

      await signAndExecuteTransaction({ transaction: txn });
      toast.success("Transaction sent");
    } else {
      // mui pop up error tips
      toast.error("Please connect your wallet first", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
  };

  return (
    <main className="main">
      <h3>
        Github Commit List: {mypackage} on {network}
      </h3>
      <p>TableID : {tableID}</p>
      <div>
        <div
          style={{
            marginBottom: "1rem",
            float: "right",
          }}
        >
          <Button variant="outlined" onClick={handleCreateRepo}>
            <AddIcon color="primary" />
          </Button>
        </div>
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
