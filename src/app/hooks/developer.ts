import { getRoochNodeUrl, RoochClient } from "@roochnetwork/rooch-sdk";
import { useQuery } from "@tanstack/react-query";

const useDeveloper = (network: any, mypackage: string, address: String) => {
  return useQuery({
    queryKey: ["developer-info", mypackage, network, address],
    queryFn: async () => {
      const client = new RoochClient({
        url: getRoochNodeUrl(network as any),
      });

      const resource = await client.getStates({
        accessPath: `/resource/${mypackage}/${mypackage}::developer::Repos`,
        stateOption: {
          decode: true,
        },
      });

      if (resource.length > 0) {
        const v = resource[0].decoded_value?.value.value as any;
        let table_id = v.value.repos.value.handle.value.id as string;
        return table_id;
      } else {
        console.log("No resource found");
        throw new Error("No resource found");
      }
    },
    enabled: !!mypackage && !!network,
    refetchInterval: 1000 * 1000,
  });
};

export default useDeveloper;
