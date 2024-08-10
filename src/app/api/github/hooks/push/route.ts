// next.js router

import {
  Args,
  RoochClient,
  Secp256k1Keypair,
  Transaction,
  getRoochNodeUrl,
} from "@roochnetwork/rooch-sdk";

const parseCommitMessge = (msg: string) => {
  let parts = msg.split("\n\n");
  let messageBody = parts[0];
  let sign_parts = parts[1].split("\n");
  let msg_hash = String(sign_parts[0]).substring(16);
  let msg_signate = String(sign_parts[1]).substring(11);
  return {
    messageBody,
    msg_hash,
    msg_signate,
  };
};

export const POST = async (req: Request) => {
  const data = await req.json();
  try {
    const commit = data.commits[0] as any;
    const repo_url = data.repository.url as string;
    const commit_url = commit.url;
    const raw_message = commit.message as string;
    const parsed = parseCommitMessge(raw_message);

    const pair = Secp256k1Keypair.fromSecretKey(process.env.PRIVATE_KEY!);
    const packageAddress = pair.getRoochAddress().toHexAddress();
    const url = getRoochNodeUrl(process.env.NETWORK as any);
    console.log(`rpc url is ${url}`);

    const client = new RoochClient({
      url,
    });

    const tx = new Transaction();
    tx.callFunction({
      target: `${packageAddress}::developer::commit`,
      args: [
        Args.string(repo_url),
        Args.string(commit_url),
        Args.string(parsed.messageBody),
        Args.string(parsed.msg_signate),
        Args.string(parsed.msg_hash),
      ],
    });

    const result = await client.signAndExecuteTransaction({
      transaction: tx,
      signer: pair,
    });
    return Response.json({
      result,
    });
  } catch (error) {
    return Response.json({ error, data });
  }
};
