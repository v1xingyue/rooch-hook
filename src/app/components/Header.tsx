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
import {
  AppBar,
  Box,
  Chip,
  Container,
  Link,
  Toolbar,
} from "@mui/material";
import { useState } from "react";
import { toast } from "react-toastify";
import LoadingButton from "@mui/lab/LoadingButton";
import { toastOptions } from "../config";
import useCoinBalance from "../hooks/rhec_coins";

const Header = () => {
  const network = process.env.NEXT_PUBLIC_NETWORK;
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
  const { data: coinBalance } = useCoinBalance(
    network,
    currentAddress?.genRoochAddress().toStr()!
  );
  const handlerCreateSessionKey = async () => {
    if (sessionLoading) {
      return;
    }
    setSessionLoading(true);

    const defaultScopes = [`${mypackage}::*::*`];
    await createSessionKey(
      {
        appName: "rooch hook",
        appUrl: location.href,
        maxInactiveInterval: 1000,
        scopes: defaultScopes,
      },
      {
        onSuccess: (result) => {
          console.log("session key", result);
          toast.success("Session key created", toastOptions);
        },
        onError: (why) => {
          console.log(why);
          toast.error("Failed to create session key", toastOptions);
        },
        onSettled: () => {
          setSessionLoading(false);
        },
      }
    );
  };

  return (
    <AppBar position="static" color="transparent" elevation={0}>
      <Container maxWidth={false}>
        <Toolbar>
          <Link
            href="/"
            style={{
              textDecoration: "none",
              fontWeight: "bold",
              fontSize: "1.5rem",
              color: "#1976d2",
              textShadow: "1px 1px 2px rgba(0, 0, 0, 0.3)",
              marginRight: "2rem", // Add space to the right
            }}
          >
            Rooch Hooks
          </Link>

          <Link
            color="primary"
            href="/"
            sx={{
              marginLeft: "1rem",
              fontWeight: "bold",
              fontSize: "1rem",
              color: "#1976d2",
              '&:hover': {
                color: "#004ba0",
              },
            }}
          >
            Home
          </Link>
          <Link
            color="primary"
            href="/swap"
            sx={{
              marginLeft: "1rem",
              fontWeight: "bold",
              fontSize: "1rem",
              color: "#1976d2",
              '&:hover': {
                color: "#004ba0",
              },
            }}
          >
            Swap
          </Link>

          <Box sx={{ flexGrow: 1 }} /> {/* Spacer to push the rest to the right */}

          {coinBalance && coinBalance.length > 0 ? (
            <Box sx={{ marginRight: "1rem" }}>
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  gap: "1rem",
                }}
              >
                {coinBalance.map((coin: any) => (
                  <li key={coin.symbol}>
                    <Chip
                      label={`${coin.balance / 10 ** coin.decimals} $${
                        coin.symbol
                      } `}
                      color="primary"
                    />
                  </li>
                ))}
              </ul>
            </Box>
          ) : null}
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
                if (session) {
                  await removeSessionKey(
                    {
                      authKey: session.getAuthKey(),
                    },
                    {
                      onSuccess: () => {
                        toast.success("Session key removed", toastOptions);
                      },
                      onSettled: () => {
                        setClearSessionLoading(false);
                      },
                      onError: (why) => {
                        console.log(why);
                        toast.error(
                          "Failed to remove session key" + why,
                          toastOptions
                        );
                      },
                    }
                  );
                }
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
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header;
