// next.js router

import {
  RoochClient,
  Secp256k1Keypair,
  Transaction,
  getRoochNodeUrl,
} from "@roochnetwork/rooch-sdk";

export const GET = async () => {
  const pair = Secp256k1Keypair.fromSecretKey(
    "roochsecretkey1q8lrmrrau6rrln96jd09hj9vd322h47nzwwzc3jrg0zcjwl8dk3mj4e8m49"
  );

  const tx = new Transaction();
  tx.callFunction({
    target:
      "rooch172g3lnwgvwt99rdzksdcuaqtrv8tp0xmqcrmr94muxp3tuwvmqfqpdcghg::developer::mint",
    args: [],
  });

  console.log(pair.getRoochAddress().toStr());
  return Response.json({
    message: "Hello from Next.js!",
    address: pair.getRoochAddress().toStr(),
  });
};
