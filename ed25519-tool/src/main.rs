use {
    anyhow,
    clap::{Parser, Subcommand},
    ed25519_dalek::{ed25519::signature::SignerMut, SigningKey},
    rand::rngs::OsRng,
    serde::{Deserialize, Serialize},
    std::fs,
};

#[derive(Debug, Deserialize, Serialize)]
pub struct MyConfig {
    pub main: Main,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct Main {
    pub secret_key: String,
}

#[derive(Parser)]
#[command(version, about, long_about = None)]
pub struct Cli {
    /// Optional name to operate on
    pub name: Option<String>,

    #[command(subcommand)]
    pub command: Option<Command>,
}

#[derive(Subcommand)]
pub enum Command {
    /// sign ed25519 signing
    Sign {
        /// file to sign (calulate sha256 bytes as sign input)
        #[arg(short, long)]
        file: Option<String>,

        /// message to sign
        #[arg(short, long)]
        msg: Option<String>,
    },
}

fn main() -> anyhow::Result<()> {
    let home_path = dirs::home_dir();
    if home_path.is_none() {
        return Err(anyhow::anyhow!("Failed to get home directory"));
    }

    let config_path = home_path.unwrap().join(".ed25519-tool.toml");
    // println!("config path: {}", config_path.to_str().unwrap());

    let mut key_pair = {
        if !config_path.exists() {
            let mut csprng = OsRng;
            let signing_key: SigningKey = SigningKey::generate(&mut csprng);
            let secretkey_str = hex::encode(signing_key.to_bytes());
            let m = MyConfig {
                main: Main {
                    secret_key: secretkey_str,
                },
            };

            let config = toml::to_string(&m)?;
            std::fs::write(config_path, config)?;
            signing_key
        } else {
            let config_content = fs::read_to_string(config_path)?;
            let config: MyConfig = toml::from_str(&config_content)?;
            let key_bytes = hex::decode(config.main.secret_key).unwrap();
            let key_array: [u8; 32] = key_bytes
                .try_into()
                .expect("secret_key must be 32 bytes long");
            let signing_key = SigningKey::from_bytes(&key_array);
            signing_key
        }
    };

    let cli = Cli::parse();
    match cli.command {
        Some(Command::Sign { file, msg }) => {
            if msg.is_none() {
                if file.is_none() {
                    println!("No file or msg specified");
                } else {
                    let file_content = fs::read_to_string(file.unwrap())?;
                    let file_bytes = file_content.as_bytes();
                    let signature: ed25519_dalek::Signature = key_pair.sign(file_bytes);
                    println!("Signature: {}", hex::encode(signature.to_bytes()));
                }
            }
        }
        None => {
            println!("No command specified");
        }
    }

    // let verifying_key: VerifyingKey = VerifyingKey::from(&key_pair);
    // let private_key = key_pair.to_bytes();
    // let public_key = verifying_key.to_bytes();

    // println!("Private Key: {}", hex::encode(private_key));
    // println!("Public Key: {}", hex::encode(public_key));
    // println!("public key bytes : {:?}", &public_key);

    // let message = b"Hello, world!";
    // let signature = key_pair.sign(message);
    // println!("Signature: {}", hex::encode(signature.to_bytes()));

    // let verified = verifying_key.verify_strict(message, &signature);
    // match verified {
    //     Ok(_) => println!("Signature is valid"),
    //     Err(_) => println!("Signature is invalid"),
    // }

    Ok(())
}
