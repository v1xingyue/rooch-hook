"use client";

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
        <TableContainer component={Paper}>
          <Table sx={{ width: "100%" }}>
            <TableHead>
              <TableRow>
                <TableCell align="left">Repo name</TableCell>
                <TableCell>Repo owner</TableCell>
                <TableCell align="right">Link</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {repos &&
                repos.map((repo) => {
                  let decode_value = repo.state.decoded_value.value.value.value;
                  return (
                    <TableRow key={repo.field_key}>
                      <TableCell align="left">
                        {decode_value.repo_name}
                      </TableCell>
                      <TableCell component="th" scope="row">
                        {decode_value.owner}
                      </TableCell>
                      <TableCell align="right">
                        <Link
                          href={`commits/${decode_value.commits.value.contents.value.handle.value.id}`}
                        >
                          Commits
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </main>
  );
}
