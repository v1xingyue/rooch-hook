import {
  useConnectWallet,
  useCreateSessionKey,
  useCurrentAddress,
  useCurrentSession,
  useRemoveSession,
  useWallets,
  useWalletStore,
} from "@roochnetwork/rooch-sdk-kit";
import { shortAddress } from "./util";
import Button from "@mui/material/Button";
import { Link, Stack } from "@mui/material";
import { useState } from "react";
import { toast } from "react-toastify";
import LoadingButton from "@mui/lab/LoadingButton";

const Header = () => {
  const mypackage = process.env.NEXT_PUBLIC_PACKAGE_ADDRESS;
  const currentAddress = useCurrentAddress();
  const wallets = useWallets();
  const connectionStatus = useWalletStore((state) => state.connectionStatus);
  const setWalletDisconnected = useWalletStore(
    (state) => state.setWalletDisconnected
  );
  const { mutateAsync: connectWallet } = useConnectWallet();
  const session = useCurrentSession();
  const [sessionLoading, setSessionLoading] = useState(false);
  const [clearSessionLoading, setClearSessionLoading] = useState(false);
  const { mutateAsync: createSessionKey } = useCreateSessionKey();
  const { mutateAsync: removeSessionKey } = useRemoveSession();
  const handlerCreateSessionKey = async () => {
    if (sessionLoading) {
      return;
    }
    setSessionLoading(true);

    const defaultScopes = [`${mypackage}::*::*`];
    createSessionKey(
      {
        appName: "rooch hook",
        appUrl: location.href,
        maxInactiveInterval: 1000,
        scopes: defaultScopes,
      },
      {
        onSuccess: (result) => {
          console.log("session key", result);
          toast.success("Session key created", {
            position: "top-right",
            autoClose: 2000,
          });
        },
        onError: (why) => {
          console.log(why);
          toast.error("Failed to create session key", {
            position: "top-right",
            autoClose: 2000,
          });
        },
      }
    ).finally(() => setSessionLoading(false));
  };

  return (
    <Stack position="static" color="default" justifyContent="flex-end">
      <div>
        <Link href="/" style={{ textDecoration: "none", fontWeight: "bold" }}>
          Rooch Hooks
        </Link>
        <span style={{ float: "right" }}>
          {!session ? (
            <LoadingButton
              loading={sessionLoading}
              loadingPosition="start"
              color="success"
              variant="contained"
              sx={{
                marginRight: "1rem",
              }}
              onClick={handlerCreateSessionKey}
            >
              Init Session
            </LoadingButton>
          ) : (
            <LoadingButton
              color="error"
              sx={{ marginRight: "1rem" }}
              variant="contained"
              loading={clearSessionLoading}
              loadingPosition="start"
              onClick={async () => {
                setClearSessionLoading(true);
                console.log(session.getAuthKey());
                const result = await removeSessionKey(
                  {
                    authKey: session.getAuthKey(),
                  },
                  {
                    onSuccess: () => {
                      toast.success("Session key removed", {
                        position: "top-right",
                        autoClose: 2000,
                      });
                    },
                  }
                );
                setClearSessionLoading(false);
              }}
            >
              Clear Session
            </LoadingButton>
          )}

          <Button
            color="primary"
            variant="contained"
            onClick={async () => {
              if (connectionStatus === "connected") {
                setWalletDisconnected();
                return;
              }
              await connectWallet({ wallet: wallets[0] });
            }}
          >
            {connectionStatus === "connected"
              ? shortAddress(currentAddress?.genRoochAddress().toStr(), 8, 6)
              : "Connect Wallet"}
          </Button>
        </span>
      </div>
    </Stack>
  );
};

export default Header;
