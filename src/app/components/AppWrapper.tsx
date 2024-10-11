"use client";

import { RoochProvider, WalletProvider } from "@roochnetwork/rooch-sdk-kit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { networkConfig } from "./networks";
import Header from "./Header";

const queryClient = new QueryClient();

const AppWrapper = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <QueryClientProvider client={queryClient}>
      <RoochProvider
        networks={networkConfig}
        defaultNetwork={process.env.NEXT_PUBLIC_NETWORK as keyof typeof networkConfig}
        onNetworkChange={(e) => console.log(e)}
      >
        <WalletProvider chain={"bitcoin"} autoConnect>
          <Header />
          {children}
        </WalletProvider>
      </RoochProvider>
    </QueryClientProvider>
  );
};

export default AppWrapper;
