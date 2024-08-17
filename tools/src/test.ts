import {
  Args,
  RoochClient,
  Secp256k1Keypair,
  Transaction,
  getRoochNodeUrl,
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
  const package_address = pair.getRoochAddress().toHexAddress();
  console.log(`package address is ${package_address}`);

  const balance = await client.getBalance({
    owner: pair.getRoochAddress().toStr(),
    coinType: "0x3::gas_coin::GasCoin",
  });
  console.log(`current balance is ${balance} `);

  const tx = new Transaction();
  tx.callFunction({
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

  // const executed = await client.signAndExecuteTransaction({
  //   transaction: tx,
  //   signer: pair,
  //   option: {
  //     withOutput: true,
  //   },
  // });

  // console.log(executed);

  const result = await client.executeViewFunction({
    target: `${package_address}::developer::test_verify`,
    args: [
      // Args.address(pair.getRoochAddress().toStr()),
      // Args.string(
      //   "5a5d8d4f2039bce419eaddabba5d1a1f74c5cc51af2857ae5fa946a65ed37221ae7ce61990dc0793beb2c37eac9b96f56f48b180221788f786f85bb23f57f205"
      // ),
      // Args.string(
      //   "eeef12db1a112cfdcdd4512533e1df68bd0612fcdec32780907b962e516f39c6bccc"
      // ),
    ],
  });

  console.log(result);

  const username = await client.executeViewFunction({
    target: `${package_address}::developer::user_name`,
    args: [Args.address(pair.getRoochAddress().toStr())],
  });

  console.log(username);

  const user_pub = await client.executeViewFunction({
    target: `${package_address}::developer::user_pub`,
    args: [Args.address(pair.getRoochAddress().toStr())],
  });

  console.log(user_pub);

  const verified = await client.executeViewFunction({
    target: `${package_address}::developer::verify_by_address`,
    args: [
      Args.address(pair.getRoochAddress().toStr()),
      Args.string(
        "caeebcb3e95304d9655ad73573714bc9259302fc4f1327519d53b494b297218f59adde389c8a154661518720b316a7e2f4a46b9df32a004b669deff87372ca04"
      ),
      Args.string(
        "348ecf10b46c5d71ffe6b34c0c388e937924aa649a19235d30d57a42eb7be8ef"
      ),
    ],
  });

  console.log(verified);

  let my_commit = new Transaction();

  my_commit.callFunction({
    target: `${package_address}::developer::commit`,
    args: [
      Args.string("https://github.com/v1xingyue/rooch-hook.git"),
      Args.string("https://github.com/v1xingyue/rooch-hook.git"),
      Args.string("submit commit with verify"),
      Args.string(
        "5a9b394595884c00b93507da165306aa4cfc2107fddaa0afe6a708ecb24d429293beeb8054f141997312ddc1cfc4125f5292ee7dad40cf730a8d9ef9329e560d"
      ),
      Args.string(
        "46d3e93ebfd3ee87ebeae589fe22df3a938fd34b619519f9a3480c5445629f33"
      ),
    ],
  });

  const submit = await client.signAndExecuteTransaction({
    transaction: my_commit,
    signer: pair,
  });

  console.log(submit);
};

main().then(null).catch(null);
