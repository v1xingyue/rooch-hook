import {
  Args,
  RoochClient,
  Secp256k1Keypair,
  Transaction,
  getRoochNodeUrl,
  toHEX,
  fromHEX,
} from "@roochnetwork/rooch-sdk";

const main = async () => {
  const privateKey =
    "roochsecretkey1q9tpz0s7378ztddva8hs0z8yuj042mq2r02awvthts2q70hzs3p2xpqp2p6";

  const url = getRoochNodeUrl("devnet");
  console.log(url);

  const client = new RoochClient({
    url,
  });

  const pair = Secp256k1Keypair.fromSecretKey(privateKey);
  console.log(pair.getRoochAddress().toStr());
  const package_address = pair.getRoochAddress().toHexAddress();

  const balance = await client.getBalance({
    owner: pair.getRoochAddress().toStr(),
    coinType: "0x3::gas_coin::GasCoin",
  });
  console.log(balance);

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
      Args.string("hello this is one commit"),
      Args.string(
        "caeebcb3e95304d9655ad73573714bc9259302fc4f1327519d53b494b297218f59adde389c8a154661518720b316a7e2f4a46b9df32a004b669deff87372ca05"
      ),
      Args.string(
        "348ecf10b46c5d71ffe6b34c0c388e937924aa649a19235d30d57a42eb7be8ef"
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
