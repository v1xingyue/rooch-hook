import { useCurrentAddress } from "@roochnetwork/rooch-sdk-kit";

const DeveloperInfo = () => {
  const address = useCurrentAddress();
  return <>{address && <p>{JSON.stringify(address)}</p>}</>;
};

export default DeveloperInfo;
