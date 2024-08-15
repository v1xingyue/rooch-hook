use {
    anyhow::{self, Result},
    clap::{Parser, Subcommand},
    ed25519_dalek::{
        ed25519::{signature::SignerMut, SignatureBytes},
        Signature, SigningKey, VerifyingKey,
    },
    env_logger::{self, Env},
    log::{debug, error, info},
    rand::rngs::OsRng,
    serde::{Deserialize, Serialize},
    sha2::{Digest, Sha256},
    std::fs,
};

#[derive(Debug, Deserialize, Serialize)]
pub struct MyConfig {
    pub main: Main,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct Main {
    pub secret_key: String,
    pub public_key: String,
    pub address: String,
}

#[derive(Parser)]
#[command(version, about, long_about = None)]
pub struct Cli {
    /// Optional name to operate on
    pub name: Option<String>,

    /// hashtype you will used
    #[arg(long, default_value = "sha256")]
    hash_type: Option<String>,

    /// Optional debug mode
    #[arg(short, long, default_value_t = false)]
    pub debug: bool,

    #[command(subcommand)]
    pub command: Option<Command>,
}

#[derive(Subcommand)]
pub enum Command {
    /// init ed25519 keypair
    Init {
        /// name of the account
        #[arg(short, long)]
        address: String,
    },

    /// sign ed25519 signing
    Sign {
        /// file to sign (calulate sha256 bytes as sign input)
        #[arg(short, long)]
        file: Option<String>,

        /// message to sign
        #[arg(short, long)]
        msg: Option<String>,
    },

    /// verify ed25519 signature
    Verify {
        /// message used to sign , msg should be hexed bytes
        #[arg(short, long)]
        msg: String,

        /// signature to verify , signature should be hexed bytes
        #[arg(short, long)]
        signature: String,
    },
}

fn load_keypair() -> Result<(ed25519_dalek::SigningKey, MyConfig), anyhow::Error> {
    let home_path = dirs::home_dir();
    if home_path.is_none() {
        return Err(anyhow::anyhow!("Failed to get home directory"));
    }
    let config_path = home_path.unwrap().join(".ed25519-tool.toml");
    debug!("config path: {}", config_path.to_str().unwrap());
    if !config_path.exists() {
        Err(anyhow::anyhow!(
            "Failed to load config file, please run `init` first"
        ))
    } else {
        let config_content = fs::read_to_string(config_path)?;
        let config: MyConfig = toml::from_str(&config_content)?;
        let key_bytes = hex::decode(&config.main.secret_key).unwrap();
        let key_array: [u8; 32] = key_bytes
            .try_into()
            .expect("secret_key must be 32 bytes long");
        let signing_key = SigningKey::from_bytes(&key_array);
        Ok((signing_key, config))
    }
}

fn main() -> anyhow::Result<()> {
    let cli = Cli::parse();
    let default_level = if cli.debug { "debug" } else { "info" };
    env_logger::Builder::from_env(Env::default().default_filter_or(default_level)).init();

    let mut hasher = {
        match cli.hash_type {
            Some(ref s) if s == "sha256" => Sha256::new(),
            _ => {
                error!("Unsupported hash type: {}", cli.hash_type.unwrap());
                std::process::exit(1);
            }
        }
    };

    match cli.command {
        Some(Command::Init { address }) => {
            let home_path = dirs::home_dir();
            if home_path.is_none() {
                return Err(anyhow::anyhow!("Failed to get home directory"));
            }
            let config_path = home_path.unwrap().join(".ed25519-tool.toml");
            let mut csprng = OsRng;
            let signing_key: SigningKey = SigningKey::generate(&mut csprng);
            let secretkey_str = hex::encode(signing_key.to_bytes());
            let verifying_key: VerifyingKey = VerifyingKey::from(&signing_key);
            let publickey_str = hex::encode(verifying_key.to_bytes());

            info!(
                "verifying_key key: {}",
                hex::encode(verifying_key.to_bytes())
            );
            info!("address is : {}", &address);

            let m = MyConfig {
                main: Main {
                    secret_key: secretkey_str,
                    public_key: publickey_str,
                    address,
                },
            };
            let config = toml::to_string(&m)?;
            info!("write config to : {}", config_path.to_str().unwrap());
            std::fs::write(config_path, config)?;

            info!("Successfully initialized");
        }

        Some(Command::Sign { file, msg }) => {
            let (mut key_pair, myconfig) = load_keypair()?;
            debug!("public_key : {:?}", key_pair.verifying_key().to_bytes());
            if msg.is_none() {
                if file.is_none() {
                    error!("No file or msg specified");
                } else {
                    let file_content = fs::read_to_string(file.unwrap())?;
                    debug!("file content: {}", file_content);
                    hasher.update(file_content.trim());
                    if !myconfig.main.address.is_empty() {
                        hasher.update(myconfig.main.address.trim())
                    }
                    let hash = hasher.finalize();
                    let signature = key_pair.sign(&hash);
                    if !myconfig.main.address.is_empty() {
                        println!("Address: {}", myconfig.main.address);
                    }
                    println!("Hash (sha256) : {}", hex::encode(hash));
                    println!("Signature: {}", hex::encode(signature.to_bytes()));
                }
            } else {
                debug!("sign as msg mode...");
                // let hash = Sha256::digest(msg.unwrap().trim()).to_vec();
                hasher.update(msg.unwrap().trim());
                let hash = hasher.finalize();
                let signature: ed25519_dalek::Signature = key_pair.sign(&hash);
                if !myconfig.main.address.is_empty() {
                    println!("Address: {}", myconfig.main.address);
                }
                println!("Hash(sha256): {}", hex::encode(hash));
                println!("Signature: {}", hex::encode(signature.to_bytes()));
            }
        }
        Some(Command::Verify { msg, signature }) => {
            let (key_pair, _) = load_keypair()?;
            debug!("public_key : {:?}", key_pair.verifying_key().to_bytes());
            let verifying_key: VerifyingKey = VerifyingKey::from(&key_pair);
            debug!("verifying_key: {:?}", &verifying_key);
            let msg_bytes = hex::decode(msg)?;
            debug!("msg bytes: {:?}", &msg_bytes);
            let signature_bytes = hex::decode(signature)?;
            let s = SignatureBytes::try_from(signature_bytes).unwrap();
            let signature = Signature::from_bytes(&s);
            let verified = verifying_key.verify_strict(&msg_bytes, &signature);
            match verified {
                Ok(_) => info!("Signature is valid"),
                Err(_) => info!("Signature is invalid"),
            }
        }
        None => {
            error!("No command specified");
            Cli::parse_from(&["ed25519-tool", "--help"]);
            std::process::exit(1);
        }
    }

    Ok(())
}
