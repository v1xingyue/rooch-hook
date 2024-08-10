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
  const package_address = pair.getRoochAddress().toHexAddress();
  console.log(`package address is ${package_address}`);

  const resource = await client.getStates({
    accessPath: `/resource/${package_address}/${package_address}::developer::DeveloperInfo`,
    stateOption: {
      decode: true,
    },
  });

  if (resource.length === 0) {
    console.log(`no resource found`);
  } else {
    const v = resource[0].decoded_value?.value.value as any;
    let table_id = v.value.commits.value.contents.value.handle.value.id;
    console.log(`commits table id is ${table_id}`);
    const commits = await client.listStates({
      accessPath: `/table/${table_id}`,
      stateOption: {
        decode: true,
        showDisplay: false,
      },
    });
    console.log(JSON.stringify(commits, null, 2));
  }
};

main().then(null).catch(null);
