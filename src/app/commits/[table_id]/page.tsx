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
        <TableContainer component={Paper}>
          <Table sx={{ width: "100%" }}>
            <TableHead>
              <TableRow>
                <TableCell>Commit time</TableCell>
                <TableCell>Commit message</TableCell>
                <TableCell>Commit address</TableCell>
                <TableCell>Commit username</TableCell>
                <TableCell>Commit Link</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {commits &&
                commits.map((commit) => {
                  let decode_value =
                    commit.state.decoded_value.value.value.value;
                  return (
                    <TableRow key={commit.field_key}>
                      <TableCell>{decode_value.commit_time}</TableCell>
                      <TableCell>{decode_value.message}</TableCell>
                      <TableCell>
                        {shortAddress(decode_value.commit_address)}
                      </TableCell>
                      <TableCell>{decode_value.commit_user}</TableCell>
                      <TableCell>
                        <a href={decode_value.commit_url}>Github</a>
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </>
  );
}
