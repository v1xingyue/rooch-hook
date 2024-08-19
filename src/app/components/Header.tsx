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
        },
        onError: (why) => {
          console.log(why);
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
            <Button
              color="success"
              variant="contained"
              sx={{ marginRight: "1rem" }}
              onClick={handlerCreateSessionKey}
            >
              Init Session
            </Button>
          ) : (
            <Button
              color="error"
              sx={{ marginRight: "1rem" }}
              variant="contained"
              onClick={async () => {
                console.log(session.getAuthKey());
                const result = await removeSessionKey({
                  authKey: session.getAuthKey(),
                });
                console.log(result);
              }}
            >
              Clear Session
            </Button>
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
