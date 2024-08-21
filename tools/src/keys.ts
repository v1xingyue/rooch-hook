import {
  Secp256k1Keypair,
  decodeRoochSercetKey,
  toHEX,
} from "@roochnetwork/rooch-sdk";
import dotenv from "dotenv";
import path from "path";
dotenv.config({
  path: path.join(__dirname, "../../.env"),
});

const main = async () => {
  const privateKey = process.env.PRIVATE_KEY as string;
  const pk = decodeRoochSercetKey(privateKey);
  console.log(toHEX(pk.secretKey));
  const pair = Secp256k1Keypair.fromSecretKey(pk.secretKey);
  console.log(pair.getBitcoinAddress());
};

main()
  .then(() => process.exit(0))
  .catch(console.error);
