import {
  RoochClient,
  Secp256k1Keypair,
  Transaction,
  getRoochNodeUrl,
} from "@roochnetwork/rooch-sdk";

const url = getRoochNodeUrl("testnet");
console.log(url);

const client = new RoochClient({
  url,
});

const pair = Secp256k1Keypair.fromSecretKey(
  "roochsecretkey1q8lrmrrau6rrln96jd09hj9vd322h47nzwwzc3jrg0zcjwl8dk3mj4e8m49"
);
console.log(pair.getRoochAddress().toStr());

const main = async () => {
  // const session = await client.createSession({
  //   sessionArgs: {
  //     appName: "simple app",
  //     appUrl: "http://localhost:3000",
  //     scopes: ["0x3::empty::empty_with_signer"],
  //   },
  //   signer: pair,
  // });
  // console.log(session);
};

main().then(null).catch(null);
