import {
  useConnectWallet,
  useCurrentAddress,
  useCurrentNetwork,
  useCurrentSession,
  useWallets,
  useWalletStore,
} from "@roochnetwork/rooch-sdk-kit";
import { shortAddress } from "./util";
import Button from "@mui/material/Button";

const Header = () => {
  const currentAddress = useCurrentAddress();
  const wallets = useWallets();
  const sessionKey = useCurrentSession();
  const connectionStatus = useWalletStore((state) => state.connectionStatus);
  const setWalletDisconnected = useWalletStore(
    (state) => state.setWalletDisconnected
  );
  const { mutateAsync: connectWallet } = useConnectWallet();

  return (
    <>
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
    </>
  );
};

export default Header;
