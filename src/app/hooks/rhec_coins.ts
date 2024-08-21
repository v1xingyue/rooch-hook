import { getRoochNodeUrl, RoochClient } from "@roochnetwork/rooch-sdk";
import { useQuery } from "@tanstack/react-query";

const useCoinBalance = (network: any, address: string) => {
  return useQuery({
    queryKey: ["coin-info", network, address],
    queryFn: async () => {
      console.log(`query coin balance ${network} ${address}`);
      const client = new RoochClient({
        url: getRoochNodeUrl(network as any),
      });

      const resource = await client.getBalances({
        owner: address,
      });

      if (resource.data.length > 0) {
        return resource.data;
      } else {
        console.log("No resource found");
        throw new Error("No resource found");
      }
    },
    enabled: !!address && !!network,
    refetchInterval: 10000,
  });
};

export default useCoinBalance;
