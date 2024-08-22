import {
  getRoochNodeUrl,
  RoochClient,
  Secp256k1Keypair,
  Transaction,
} from "@roochnetwork/rooch-sdk";
import { NextRequest } from "next/server";

export const POST = async (
  req: NextRequest,
  { params }: { params: { address: string } }
) => {
  const url = getRoochNodeUrl(process.env.NEXT_PUBLIC_NETWORK as any);
  console.log(`rpc url is ${url}`);
  const pair = Secp256k1Keypair.fromSecretKey(process.env.PRIVATE_KEY!);

  const tx = new Transaction();
  tx.callFunction({
    contractAddress: "0x0000000000000000000000000000000000000000",
  });

  const client = new RoochClient({
    url,
  });

  return Response.json({
    address: params.address,
  });
};
