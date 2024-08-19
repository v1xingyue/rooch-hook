import { getRoochNodeUrl, RoochClient } from "@roochnetwork/rooch-sdk";
import { useQuery } from "@tanstack/react-query";

const useRoochTableData = (
  queryKey: string,
  network: any,
  tableId: string | undefined
) => {
  return useQuery({
    queryKey: [queryKey, tableId, network],
    queryFn: async () => {
      if (tableId) {
        const client = new RoochClient({
          url: getRoochNodeUrl(network as any),
        });
        const commits = await client.listStates({
          accessPath: `/table/${tableId}`,
          stateOption: {
            decode: true,
            showDisplay: false,
          },
        });
        return commits.data as any[];
      } else {
        return [];
      }
    },
    enabled: !!tableId && !!network,
    refetchInterval: 10000,
  });
};

export default useRoochTableData;
