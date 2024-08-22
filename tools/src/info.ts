import {
  Args,
  RoochClient,
  Secp256k1Keypair,
  Transaction,
  getRoochNodeUrl,
  toHEX,
  fromHEX,
} from "@roochnetwork/rooch-sdk";
import path from "path";
import dotenv from "dotenv";
dotenv.config({
  path: path.join(__dirname, "../../.env"),
});

const main = async () => {
  const network = process.env.NEXT_PUBLIC_ROOCH_NETWORK as string;
  const url = getRoochNodeUrl(process.env.NEXT_PUBLIC_NETWORK as any);
  console.log(url);
  const mypackage = process.env.NEXT_PUBLIC_PACKAGE_ADDRESS as string;
  const address =
    "0xe42e88f0e87f799450c27e07d7d7d31ba0c379e007e6bdcfeb66964784360006";

  const client = new RoochClient({ url });

  const info = await client.getStates({
    accessPath: `/resource/${mypackage}/${address}::developer::DeveloperInfo`,
    stateOption: {
      decode: true,
    },
  });
  console.log(info);
};

main()
  .then(() => {
    console.log("done");
  })
  .catch((e) => {
    console.error(e);
  });
