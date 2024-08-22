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
  const url = getRoochNodeUrl(process.env.NEXT_PUBLIC_NETWORK as any);
  console.log(`rpc url is ${url}`);

  const client = new RoochClient({
    url,
  });

  const pair = Secp256k1Keypair.fromSecretKey(privateKey);
  console.log(`rooch address is ${pair.getRoochAddress().toStr()}`);
  const package_address = process.env.NEXT_PUBLIC_PACKAGE_ADDRESS as string;
  console.log(`package address is ${package_address}`);

  const balance = await client.getBalance({
    owner: pair.getRoochAddress().toStr(),
    coinType: "0x3::gas_coin::GasCoin",
  });
  console.log(`current balance is ${JSON.stringify(balance)} `);

  console.log(`sender address is ${pair.getRoochAddress().toHexAddress()} `);

  const mint_tx = new Transaction();
  mint_tx.callFunction({
    target: `${package_address}::developer::update_or_mint`,
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

  console.log(JSON.stringify(submit));

  const events = await client.getEvents({
    eventHandleType: `${package_address}::developer::DeveloperEvent`,
  });
  console.log(JSON.stringify(events));
};

main().then(null).catch(null);
