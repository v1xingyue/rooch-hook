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
    secp256k1::{Keypair, Secp256k1, SecretKey},
    serde::{Deserialize, Serialize},
    sha2::{digest::DynDigest, Digest, Sha224, Sha256, Sha384, Sha512, Sha512_224, Sha512_256},
    std::{fs, path::PathBuf},
};

#[derive(Debug, Deserialize, Serialize)]
pub struct MyConfig {
    pub main: Main,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct Main {
    pub key_type: String,
    pub secret_key: String,
    pub public_key: String,
    pub address: String,
}

#[derive(Parser)]
#[command(version, about, long_about = None)]
pub struct Cli {
    /// Optional name to operate on
    pub name: Option<String>,

    /// hashtype you will used (sha224,sha256,sha512_224,sha512_256,sha384,sha512)
    #[arg(long, default_value = "sha256")]
    hash: Option<String>,

    /// Optional debug mode
    #[arg(short, long, default_value_t = false)]
    pub debug: bool,

    #[command(subcommand)]
    pub command: Option<Command>,
}

#[derive(Subcommand)]
pub enum Command {
    /// init keypair
    Init {
        /// key type (ed25519,secp256k1)
        #[arg(long, default_value = "ed25519")]
        key_type: Option<String>,

        /// name of the account
        #[arg(short, long)]
        address: String,
    },

    /// sign ed25519 signing
    Sign {
        /// file to sign (calulate hash bytes as sign input)
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

fn config_path() -> Result<PathBuf> {
    let home_path = dirs::home_dir();
    if home_path.is_none() {
        return Err(anyhow::anyhow!("Failed to get home directory"));
    }
    Ok(home_path.unwrap().join(".ed25519-tool.toml"))
}

fn load_keypair() -> Result<(ed25519_dalek::SigningKey, MyConfig), anyhow::Error> {
    let config_path = config_path()?;
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

    let mut hasher: Box<dyn DynDigest> = {
        match cli.hash {
            Some(ref s) => match s.as_str() {
                "sha224" => Box::new(Sha224::new()),
                "sha256" => Box::new(Sha256::new()),
                "sha512_224" => Box::new(Sha512_224::new()),
                "sha512_256" => Box::new(Sha512_256::new()),
                "sha384" => Box::new(Sha384::new()),
                "sha512" => Box::new(Sha512::new()),
                _ => {
                    error!("Unsupported hash type: {}", cli.hash.unwrap());
                    std::process::exit(1)
                }
            },
            _ => {
                error!("Unsupported hash type: {}", cli.hash.unwrap());
                std::process::exit(1);
            }
        }
    };

    match cli.command {
        Some(Command::Init { address, key_type }) => {
            let config_path = config_path()?;

            if config_path.exists() {
                error!("Config file already exists");
            } else {
                match key_type.as_deref() {
                    Some("ed25519") => {
                        let signing_key = SigningKey::generate(&mut OsRng);
                        let secretkey_str = hex::encode(signing_key.to_bytes());
                        let verifying_key = VerifyingKey::from(&signing_key);
                        let publickey_str = hex::encode(verifying_key.to_bytes());
                        info!(
                            "verifying_key key: {}",
                            hex::encode(verifying_key.to_bytes())
                        );
                        info!("address is : {}", &address);

                        let m = MyConfig {
                            main: Main {
                                key_type: key_type.unwrap(),
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
                    Some("secp256k1") => {
                        let secp = Secp256k1::new();
                        let secret_key = SecretKey::new(&mut OsRng);
                        let key_pair = Keypair::from_secret_key(&secp, &secret_key);
                        let public_key = key_pair.public_key();
                        info!("verifying_key key: {}", hex::encode(public_key.serialize()));
                        info!("address is : {}", &address);

                        let m = MyConfig {
                            main: Main {
                                key_type: key_type.unwrap(),
                                secret_key: hex::encode(secret_key.as_ref()),
                                public_key: hex::encode(public_key.serialize()),
                                address,
                            },
                        };

                        let config = toml::to_string(&m)?;
                        info!("write config to : {}", config_path.to_str().unwrap());
                        std::fs::write(config_path, config)?;

                        std::process::exit(1);
                    }
                    _ => {
                        error!("No key type specified");
                        std::process::exit(1);
                    }
                }
            }
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
                    hasher.update(file_content.trim().as_bytes());
                    if !myconfig.main.address.is_empty() {
                        hasher.update(myconfig.main.address.trim().as_bytes())
                    }
                    let hash = hasher.finalize();
                    let signature = key_pair.sign(&hash);
                    if !myconfig.main.address.is_empty() {
                        println!("Address: {}", myconfig.main.address);
                    }
                    println!("Hash ({}) : {}", cli.hash.unwrap(), hex::encode(hash));
                    println!("Signature: {}", hex::encode(signature.to_bytes()));
                }
            } else {
                debug!("sign as msg mode...");
                // let hash = Sha256::digest(msg.unwrap().trim()).to_vec();
                hasher.update(msg.unwrap().trim().as_bytes());
                let hash = hasher.finalize();
                let signature: ed25519_dalek::Signature = key_pair.sign(&hash);
                if !myconfig.main.address.is_empty() {
                    println!("Address: {}", myconfig.main.address);
                }
                println!("Hash ({}) : {}", cli.hash.unwrap(), hex::encode(hash));
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
