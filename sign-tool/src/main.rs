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
    secp256k1::{Keypair, Message, Secp256k1, SecretKey},
    serde::{Deserialize, Serialize},
    sha2::{digest::DynDigest, Digest, Sha256},
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

fn config_path() -> Result<PathBuf> {
    let home_path = dirs::home_dir();
    if home_path.is_none() {
        return Err(anyhow::anyhow!("Failed to get home directory"));
    }
    Ok(home_path.unwrap().join(".sign-tool.toml"))
}

impl MyConfig {
    pub fn load() -> Result<Self, anyhow::Error> {
        let config_path = config_path()?;
        debug!("config path: {}", config_path.to_str().unwrap());
        if !config_path.exists() {
            Err(anyhow::anyhow!(
                "Failed to load config file, please run `init` first"
            ))
        } else {
            let config_content = fs::read_to_string(config_path)?;
            let config: MyConfig = toml::from_str(&config_content)?;
            Ok(config)
        }
    }

    pub fn exists() -> Result<bool> {
        let config_path = config_path()?;
        Ok(config_path.exists())
    }

    pub fn generate(address: String, key_type: Option<String>) -> Self {
        info!(
            "Generating new key pair... key_type : {}",
            key_type.as_ref().unwrap()
        );

        info!("address is : {}", &address);

        let (secret_key, verify_key) = match key_type.as_deref() {
            Some("ed25519") => {
                let signing_key = SigningKey::generate(&mut OsRng);
                let verifying_key = VerifyingKey::from(&signing_key);
                info!("verifying_key : {}", hex::encode(verifying_key.to_bytes()));
                (
                    signing_key.to_bytes().to_vec(),
                    verifying_key.to_bytes().to_vec(),
                )
            }
            Some("secp256k1") => {
                let secp = Secp256k1::new();
                let secret_key = SecretKey::new(&mut OsRng);
                let key_pair = Keypair::from_secret_key(&secp, &secret_key);
                let public_key = key_pair.public_key();
                info!("verifying_key : {}", hex::encode(public_key.serialize()));
                (
                    secret_key.as_ref().to_vec(),
                    public_key.serialize().to_vec(),
                )
            }
            _ => {
                error!("No key type specified");
                std::process::exit(1);
            }
        };
        return MyConfig {
            main: Main {
                key_type: key_type.unwrap_or("ed25519".to_string()),
                secret_key: hex::encode(secret_key),
                public_key: hex::encode(verify_key),
                address,
            },
        };
    }

    pub fn load_ed25519(&self) -> Result<SigningKey, anyhow::Error> {
        let key_bytes = hex::decode(&self.main.secret_key)?;
        let key_array: [u8; 32] = key_bytes
            .try_into()
            .expect("secret_key must be 32 bytes long");
        let signing_key = SigningKey::from_bytes(&key_array);
        Ok(signing_key)
    }

    pub fn load_secp256k1(&self) -> Result<Keypair, anyhow::Error> {
        let secp = Secp256k1::new();
        let key_bytes = hex::decode(&self.main.secret_key)?;
        let key_array: [u8; 32] = key_bytes
            .try_into()
            .expect("secret_key must be 32 bytes long");
        let secret_key = SecretKey::from_slice(&key_array)?;
        let key_pair = Keypair::from_secret_key(&secp, &secret_key);
        Ok(key_pair)
    }
}

#[derive(Parser)]
#[command(version, about, long_about = None)]
pub struct Cli {
    /// Optional name to operate on
    pub name: Option<String>,

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

fn main() -> anyhow::Result<()> {
    let cli = Cli::parse();
    let default_level = if cli.debug { "debug" } else { "info" };
    env_logger::Builder::from_env(Env::default().default_filter_or(default_level)).init();

    let mut hasher: Box<dyn DynDigest> = Box::new(Sha256::new());

    match cli.command {
        Some(Command::Init { address, key_type }) => {
            if MyConfig::exists()? {
                error!("Config file already exists");
            } else {
                let config = MyConfig::generate(address, key_type);
                let config_path = config_path()?;
                fs::write(config_path, toml::to_string(&config).unwrap())?;
                info!("Config file created successfully");
            }
        }

        Some(Command::Sign { file, msg }) => {
            let config = MyConfig::load()?;
            if config.main.key_type.as_str() == "secp256k1" {
                let secp = Secp256k1::new();
                let key_pair = config.load_secp256k1()?;
                debug!("public_key : {}", key_pair.public_key().to_string());
                if msg.is_none() {
                    let file_content = fs::read_to_string(file.unwrap())?;
                    debug!("file content: {}", file_content);
                    hasher.update(file_content.trim().as_bytes());
                    if !config.main.address.is_empty() {
                        hasher.update(config.main.address.trim().as_bytes())
                    }
                    let hash = hasher.finalize();
                    let message = Message::from_digest_slice(&hash)?;
                    let signature = secp.sign_ecdsa(&message, &key_pair.secret_key());
                    if !config.main.address.is_empty() {
                        println!("Address: {}", config.main.address);
                    }
                    println!("Hash: {}", hex::encode(hash));
                    println!("Signature: {}", hex::encode(signature.serialize_compact()));
                } else {
                    debug!("sign as msg mode...");
                    hasher.update(msg.unwrap().trim().as_bytes());
                    let hash = hasher.finalize();
                    let message = Message::from_digest_slice(&hash)?;
                    let signature = secp.sign_ecdsa(&message, &key_pair.secret_key());
                    if !config.main.address.is_empty() {
                        println!("Address: {}", config.main.address);
                    }
                    println!("Hash: {}", hex::encode(hash));
                    println!("Signature: {}", hex::encode(signature.serialize_compact()));
                }
            } else {
                let mut key_pair = config.load_ed25519()?;
                debug!("public_key : {:?}", key_pair.verifying_key().to_bytes());
                if msg.is_none() {
                    let file_content = fs::read_to_string(file.unwrap())?;
                    debug!("file content: {}", file_content);
                    hasher.update(file_content.trim().as_bytes());
                    if !config.main.address.is_empty() {
                        hasher.update(config.main.address.trim().as_bytes())
                    }
                    let hash = hasher.finalize();
                    let signature = key_pair.sign(&hash);
                    if !config.main.address.is_empty() {
                        println!("Address: {}", config.main.address);
                    }
                    println!("Signature: {}", hex::encode(signature.to_bytes()));
                } else {
                    debug!("sign as msg mode...");
                    // let hash = Sha256::digest(msg.unwrap().trim()).to_vec();
                    hasher.update(msg.unwrap().trim().as_bytes());
                    let hash = hasher.finalize();
                    let signature: ed25519_dalek::Signature = key_pair.sign(&hash);
                    if !config.main.address.is_empty() {
                        println!("Address: {}", config.main.address);
                    }
                    println!("Signature: {}", hex::encode(signature.to_bytes()));
                }
            }
        }
        Some(Command::Verify { msg, signature }) => {
            let config = MyConfig::load()?;
            if config.main.key_type.as_str() == "secp256k1" {
                let key_pair = config.load_secp256k1()?;
                let secp = Secp256k1::new();
                let msg_bytes = hex::decode(msg)?;
                let signature_bytes = hex::decode(signature)?;
                let s = SignatureBytes::try_from(signature_bytes).unwrap();
                let signature_struct = secp256k1::ecdsa::Signature::from_compact(&s)?;
                let message = Message::from_digest_slice(&msg_bytes)?;
                let verified =
                    secp.verify_ecdsa(&message, &signature_struct, &key_pair.public_key());
                match verified {
                    Ok(_) => info!("Signature is valid"),
                    Err(_) => info!("Signature is invalid"),
                }
            } else {
                let key_pair = config.load_ed25519()?;
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
        }
        _ => {
            error!("No command specified");
            Cli::parse_from(&["sign-tool", "--help"]);
            std::process::exit(1);
        }
    }

    Ok(())
}
