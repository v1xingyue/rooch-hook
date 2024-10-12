import { getRoochNodeUrl, RoochClient } from "@roochnetwork/rooch-sdk";
import { useQuery } from "@tanstack/react-query";

const usePool = (network: any, mypackage: string) => {
  return useQuery({
    queryKey: ["pool_info", mypackage, network],
    queryFn: async () => {
      const client = new RoochClient({
        url: getRoochNodeUrl(network as any),
      });

      const resource = await client.getStates({
        accessPath: `/resource/${mypackage}/${mypackage}::swap::Pool<${mypackage}::rhec_coin::RHEC,0x3::gas_coin::RGas>`,
        stateOption: {
          decode: true,
        },
      });
    },
    enabled: !!mypackage && !!network,
    refetchInterval: 10 * 1000,
  });
};

export default usePool;
