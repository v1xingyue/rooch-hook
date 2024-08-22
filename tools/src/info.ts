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
  const privateKey = process.env.PRIVATE_KEY as string;
  const network = process.env.NEXT_PUBLIC_ROOCH_NETWORK as string;
  const url = getRoochNodeUrl(process.env.NEXT_PUBLIC_NETWORK as any);
  console.log(url);
  const mypackage = process.env.NEXT_PUBLIC_PACKAGE_ADDRESS as string;
  const client = new RoochClient({ url });

  const pair = Secp256k1Keypair.fromSecretKey(privateKey);
  const address = pair.getRoochAddress().toHexAddress();

  const info = await client.getStates({
    accessPath: `/resource/${address}/${mypackage}::developer::DeveloperInfo`,
    stateOption: {
      decode: true,
    },
  });
  console.log(JSON.stringify(info, null, 2));
};

main()
  .then(() => {
    console.log("done");
  })
  .catch((e) => {
    console.error(e);
  });
