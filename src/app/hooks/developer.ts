import { getRoochNodeUrl, RoochClient } from "@roochnetwork/rooch-sdk";
import { useQuery } from "@tanstack/react-query";

const useDeveloper = (network: any, mypackage: string, address: string) => {
  return useQuery({
    queryKey: ["developer-info", mypackage, network, address],
    queryFn: async () => {
      console.log("query developer info ", mypackage, network, address);
      const client = new RoochClient({
        url: getRoochNodeUrl(network as any),
      });

      const resource = await client.getStates({
        accessPath: `/resource/${mypackage}/${address}::developer::DeveloperInfo`,
        stateOption: {
          decode: true,
        },
      });

      console.log(resource);

      if (resource.length > 0) {
        // const v = resource[0].decoded_value?.value.value as any;
        return resource[0].decoded_value?.value.value as any;
      } else {
        console.log("No resource found");
        throw new Error("No resource found");
      }
    },
    enabled: !!mypackage && !!network && !!address,
    refetchInterval: 20_000,
  });
};

export default useDeveloper;
