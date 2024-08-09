import {
  RoochClient,
  Secp256k1Keypair,
  Transaction,
  getRoochNodeUrl,
} from "@roochnetwork/rooch-sdk";

const main = async () => {
  const url = getRoochNodeUrl("testnet");
  console.log(url);

  const client = new RoochClient({
    url,
  });

  const pair = Secp256k1Keypair.fromSecretKey(
    "roochsecretkey1q9slusee3zj2pq7t2f2ygup90ghjra7rltkz8mrzemce00semr37jrhexm8"
  );
  console.log(pair.getRoochAddress().toStr());
  const hex_address = pair.getRoochAddress().toHexAddress();
  console.log(hex_address);

  const balance = await client.getBalance({
    owner: pair.getRoochAddress().toStr(),
    coinType: "0x3::gas_coin::GasCoin",
  });
  console.log(balance);
};

main().then(null).catch(null);
