import { getRoochNodeUrl, RoochClient } from "@roochnetwork/rooch-sdk";
import { useQuery } from "@tanstack/react-query";

const useRepos = (network: any, mypackage: string) => {
  return useQuery({
    queryKey: ["repos_info", mypackage, network],
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
    refetchInterval: 10000,
  });
};

export default useRepos;
