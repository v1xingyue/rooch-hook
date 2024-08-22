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

  const client = new RoochClient({
    url,
  });

  const result = await client.transfer({
    signer: pair,
    recipient: params.address,
    amount: BigInt(3000_000_000),
    coinType: "0x3::gas_coin::GasCoin" as any,
  });

  return Response.json({
    result,
  });
};
