import {
  RoochClient,
  Secp256k1Keypair,
  getRoochNodeUrl,
} from "@roochnetwork/rooch-sdk";
import path from "path";

import dotenv from "dotenv";
dotenv.config({
  path: path.join(__dirname, "../../.env"),
});

const main = async () => {
  const privateKey = process.env.PRIVATE_KEY as string;
  const url = getRoochNodeUrl(process.env.NEXT_PUBLIC_NETWORK as any);
  console.log(`rpc url is ${url}`);

  const client = new RoochClient({
    url,
  });

  const pair = Secp256k1Keypair.fromSecretKey(privateKey);
  console.log(`rooch address is ${pair.getRoochAddress().toStr()}`);
  const package_address = process.env.NEXT_PUBLIC_PACKAGE_ADDRESS as string;
  console.log(`package address is ${package_address}`);

  let table_id =
    "0x59a2384059899f8458d0febadf68c56c7380e4b9a1bfb8d37ffc7d4568640d99";
  console.log(`commits table id is ${table_id}`);
  const commits = await client.listStates({
    accessPath: `/table/${table_id}`,
    stateOption: {
      decode: true,
      showDisplay: false,
    },
    limit: "10000",
  });
  console.log(JSON.stringify(commits, null, 2));
};

main().then(null).catch(null);
