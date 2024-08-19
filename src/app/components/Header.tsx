import {
  useConnectWallet,
  useCurrentAddress,
  useWallets,
  useWalletStore,
} from "@roochnetwork/rooch-sdk-kit";
import { shortAddress } from "./util";
import Button from "@mui/material/Button";
import { Link, Stack } from "@mui/material";

const Header = () => {
  const currentAddress = useCurrentAddress();
  const wallets = useWallets();
  const connectionStatus = useWalletStore((state) => state.connectionStatus);
  const setWalletDisconnected = useWalletStore(
    (state) => state.setWalletDisconnected
  );
  const { mutateAsync: connectWallet } = useConnectWallet();

  return (
    <Stack position="static" color="default" justifyContent="flex-end">
      <div>
        <Link href="/" style={{ textDecoration: 'none',fontWeight:"bold" }} >Rooch Hooks</Link>
        <span style={{float:"right"}}>
          <Button
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
