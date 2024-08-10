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
  const url = getRoochNodeUrl(process.env.NETWORK as any);
  console.log(`rpc url is ${url}`);

  const client = new RoochClient({
    url,
  });

  const pair = Secp256k1Keypair.fromSecretKey(privateKey);
  console.log(`rooch address is ${pair.getRoochAddress().toStr()}`);
  const package_address = pair.getRoochAddress().toHexAddress();
  console.log(`package address is ${package_address}`);

  const balance = await client.getBalance({
    owner: pair.getRoochAddress().toStr(),
    coinType: "0x3::gas_coin::GasCoin",
  });
  console.log(`current balance is ${balance} `);

  const mint_tx = new Transaction();
  mint_tx.callFunction({
    target: `${package_address}::developer::mint`,
    args: [
      Args.string("v1xingyue"),
      Args.vec(
        "u8",
        fromHEX(
          "6382c729be8d6c0b4306d88037b4658bcb31f5f33f50230da6b925c1b8dd5719"
        ) as any
      ),
    ],
  });

  const submit = await client.signAndExecuteTransaction({
    transaction: mint_tx,
    signer: pair,
  });

  console.log(submit);
};

main().then(null).catch(null);
