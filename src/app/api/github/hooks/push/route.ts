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
  if (sign_parts.length >= 3) {
    let count = sign_parts.length;
    let commitAddress = String(sign_parts[count - 3])
      .split(":")[1]
      .trim();
    let msg_hash = String(sign_parts[count - 2])
      .split(":")[1]
      .trim();
    let msg_signate = String(sign_parts[count - 1])
      .split(":")[1]
      .trim();

    return {
      commitAddress,
      messageBody,
      msg_hash,
      msg_signate,
    };
  }
};

export const POST = async (req: Request) => {
  const data = await req.json();
  let params = {};
  try {
    const commit = data.commits[0] as any;
    const repo_url = data.repository.url as string;
    const commit_url = commit.url;
    const raw_message = commit.message as string;
    const parsed = parseCommitMessge(raw_message)!;
    const commit_user = commit.committer.username;

    const pair = Secp256k1Keypair.fromSecretKey(process.env.PRIVATE_KEY!);
    const packageAddress = process.env.NEXT_PUBLIC_PACKAGE_ADDRESS;
    const url = getRoochNodeUrl(process.env.NEXT_PUBLIC_NETWORK as any);
    console.log(`rpc url is ${url}`);

    const client = new RoochClient({
      url,
    });

    params = {
      target: `${packageAddress}::developer::commit`,
      args: [
        parsed.commitAddress,
        repo_url,
        commit_url,
        parsed.messageBody,
        commit_user,
        parsed.msg_signate,
        parsed.msg_hash,
      ],
    };

    const tx = new Transaction();
    tx.callFunction({
      target: `${packageAddress}::developer::commit`,
      args: [
        Args.address(parsed.commitAddress),
        Args.string(repo_url),
        Args.string(commit_url),
        Args.string(parsed.messageBody),
        Args.string(commit_user),
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
    return Response.json({ error, params });
  }
};
