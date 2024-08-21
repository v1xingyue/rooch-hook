import {
  useCurrentAddress,
  useCurrentNetwork,
  useCurrentSession,
  UseSignAndExecuteTransaction,
} from "@roochnetwork/rooch-sdk-kit";
import useDeveloper from "../hooks/developer";
import { Container, TextField } from "@mui/material";
import { useEffect, useState } from "react";
import { LoadingButton } from "@mui/lab";
import { Args, fromHEX, Transaction } from "@roochnetwork/rooch-sdk";
import { toast } from "react-toastify";
import { toastOptions } from "../config";

const DeveloperInfo = () => {
  const network = useCurrentNetwork();
  const mypackage = process.env.NEXT_PUBLIC_PACKAGE_ADDRESS as string;
  const [isLoading, setIsLoading] = useState(false);
  const {
    data: developerInfo,
    isLoading: isLoadingCommits,
    error: commitsError,
  } = useDeveloper(network, mypackage, mypackage);
  const [info, setInfo] = useState<any>({});
  const session = useCurrentSession();
  const { mutateAsync: signAndExecuteTransaction } =
    UseSignAndExecuteTransaction();

  const updateDeveloperInfo = async () => {
    setIsLoading(true);
    const tx = new Transaction();
    tx.callFunction({
      address: mypackage,
      module: "developer",
      function: "update_or_mint",
      args: [
        Args.string(info.name),
        Args.vec("u8", fromHEX(info.signer_pub) as any),
      ],
    });
    try {
      const result = await signAndExecuteTransaction({
        transaction: tx,
      });
      console.log(result);
      toast.success("Developer info updated", toastOptions);
    } catch (error) {
      toast.error("Failed to update developer info", toastOptions);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (developerInfo) {
      setInfo(developerInfo.value);
    }
  }, [developerInfo]);

  return (
    <Container maxWidth={false}>
      {developerInfo && (
        <div style={{ display: "flex", alignItems: "center" }}>
          <TextField
            label="Name"
            value={info.name}
            sx={{ width: "15%" }}
            onChange={(e) => setInfo({ ...info, name: e.target.value })}
          />
          <TextField
            label="Signer Public Key"
            value={info.signer_pub}
            sx={{ width: "55%", marginLeft: "1rem" }}
            onChange={(e) => setInfo({ ...info, signer_pub: e.target.value })}
          />

          <LoadingButton
            loading={isLoading}
            variant="contained"
            sx={{
              marginLeft: "1rem",
            }}
            onClick={async () => {
              await updateDeveloperInfo();
            }}
          >
            Update Developer Info
          </LoadingButton>
        </div>
      )}
    </Container>
  );
};

export default DeveloperInfo;
