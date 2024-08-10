module github_event::developer {

    use std::string::{String,into_bytes};
    use moveos_std::account;
    use moveos_std::table_vec;
    use moveos_std::signer;
    use moveos_std::timestamp;
    use rooch_framework::ed25519;
    use moveos_std::hex;
    
    const E_COMMIT_VERIFY_FAILED: u64 = 1;

    struct Commit has store {
        commit_time : u64,
        message: String,
        repo_url: String,
        commit_url: String
    }

    struct DeveloperInfo has key {
        name: String,
        signer_pub: vector<u8>,
        commits: table_vec::TableVec<Commit>,
    }

    entry fun mint(signer:&signer,name:String,signer_pub:vector<u8>){
        account::move_resource_to(signer, DeveloperInfo { name,signer_pub,commits: table_vec::new()});
    }
    
    entry fun commit(signer:&signer,repo_url:String,commit_url:String,message:String,_signature:String,_msg_hash:String){
        let  dev_info = account::borrow_mut_resource<DeveloperInfo>(signer::address_of(signer));
        let v = verify_by_address(signer::address_of(signer),_signature,_msg_hash);
        assert!(v, E_COMMIT_VERIFY_FAILED);
        let commit_time = timestamp::now_seconds();
        table_vec::push_back(&mut dev_info.commits, Commit { commit_time,message,repo_url,commit_url});
    }

    // view
    public fun user_name(addr: address): String {
        let dev_info = account::borrow_resource<DeveloperInfo>(addr);
        dev_info.name
    }

    // view
    public fun user_pub(addr: address): vector<u8> {
        let dev_info = account::borrow_resource<DeveloperInfo>(addr);
        dev_info.signer_pub
    }

    // view
    public fun verify_by_address(addr: address,signature: String, msg_hash: String): bool {
        let dev_info = account::borrow_resource<DeveloperInfo>(addr);
        
        let pub_key = dev_info.signer_pub;
        
        let a_bytes = into_bytes(signature);
        let signature_bytes = hex::decode(&a_bytes);

        let b_bytes = into_bytes(msg_hash);
        let msg_bytes = hex::decode(&b_bytes);

        ed25519::verify(&signature_bytes,&pub_key,&msg_bytes)
    }

    #[test]
    public fun test_verifyfy(){

        let pk = x"6382c729be8d6c0b4306d88037b4658bcb31f5f33f50230da6b925c1b8dd5719";
        let msg = x"eeef12db1a112cfdcdd4512533e1df68bd0612fcdec32780907b962e516f39c6bccc";
        let signature = x"5a5d8d4f2039bce419eaddabba5d1a1f74c5cc51af2857ae5fa946a65ed37221ae7ce61990dc0793beb2c37eac9b96f56f48b180221788f786f85bb23f57f205";

        let result =  ed25519::verify(&signature,&pk,&msg);

        assert!(result, 1);
    }

}
