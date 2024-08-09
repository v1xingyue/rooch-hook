module github_event::developer {

    use std::string::{String,into_bytes};
    use moveos_std::account;
    use moveos_std::table_vec;
    use moveos_std::signer;
    use moveos_std::timestamp;
    use rooch_framework::ed25519;
    
    struct Commit has store {
        commit_time : u64,
        message: String,
        repo_url: String,
        commit_url: String
    }

    struct DeveloperInfo has key {
        name: String,
        signer_pub: String,
        commits: table_vec::TableVec<Commit>,
    }

    entry fun mint(signer:&signer,name:String,signer_pub:String){
        account::move_resource_to(signer, DeveloperInfo { name,signer_pub,commits: table_vec::new()});
    }
    
    // native public fun verify(signature: &vector<u8>, public_key: &vector<u8>, msg: &vector<u8>): bool;
    entry fun commit(signer:&signer,repo_url:String,commit_url:String,message:String,signature:String,msg_hash:String){
        let  dev_info = account::borrow_mut_resource<DeveloperInfo>(signer::address_of(signer));
        // ed25519::verify(&signature,&into_bytes(dev_info.signer_pub),&msg_hash);
        let commit_time = timestamp::now_seconds();
        table_vec::push_back(&mut dev_info.commits, Commit { commit_time,message,repo_url,commit_url});
    }

    // view
    public fun verify_by_address(addres: address,signature: String, msg_hash: String): bool {
        true
    }

}
