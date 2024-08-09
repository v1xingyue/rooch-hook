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

  const resource = await client.getStates({
    accessPath: `/resource/0x28aae6ffa6ec731f1c5bab813e65f236e8700980d031e1f2bbaaa54285421ed3/0x28aae6ffa6ec731f1c5bab813e65f236e8700980d031e1f2bbaaa54285421ed3::developer::DeveloperInfo`,
    stateOption: {
      decode: true,
    },
  });

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
};

main().then(null).catch(null);
