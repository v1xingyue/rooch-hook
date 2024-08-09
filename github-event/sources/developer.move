module github_event::developer {

    use std::string::{String,into_bytes};
    use moveos_std::account;
    use moveos_std::table_vec;
    use moveos_std::signer;
    use moveos_std::timestamp;
    use rooch_framework::ed25519;
    use moveos_std::hex;
    
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
    
    // native public fun verify(signature: &vector<u8>, public_key: &vector<u8>, msg: &vector<u8>): bool;
    entry fun commit(signer:&signer,repo_url:String,commit_url:String,message:String,_signature:String,_msg_hash:String){
        let  dev_info = account::borrow_mut_resource<DeveloperInfo>(signer::address_of(signer));
        // ed25519::verify(&signature,&into_bytes(dev_info.signer_pub),&msg_hash);
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

    // view
    public fun verify_by_address_x(addr: address,signature_bytes: vector<u8>, msg_bytes: vector<u8>): bool {
        let dev_info = account::borrow_resource<DeveloperInfo>(addr);
        let pub_key = dev_info.signer_pub;
        ed25519::verify(&signature_bytes,&pub_key,&msg_bytes)
    }

    // view
    public fun test_verify(): u8{
        
        // let a = b"0x6382c729be8d6c0b4306d88037b4658bcb31f5f33f50230da6b925c1b8dd5719";

        // let pub_bytes = into_bytes(string::utf8(b"0x6382c729be8d6c0b4306d88037b4658bcb31f5f33f50230da6b925c1b8dd5719"));
        // let pub_key = hex::decode(&pub_bytes);

        // let b_bytes = into_bytes(string::utf8(b"0xeeef12db1a112cfdcdd4512533e1df68bd0612fcdec32780907b962e516f39c6bccc"));
        // let msg_bytes = hex::decode(&b_bytes);

        // let a_bytes = into_bytes(string::utf8(b"0x5a5d8d4f2039bce419eaddabba5d1a1f74c5cc51af2857ae5fa946a65ed37221ae7ce61990dc0793beb2c37eac9b96f56f48b180221788f786f85bb23f57f205"));
        // let signature_bytes = hex::decode(&a_bytes);

        let msg = x"315f5bdb76d078c43b8ac0064e4a0164612b1fce77c869345bfc94c75894edd3";
        let pk = x"cc62332e34bb2d5cd69f60efbb2a36cb916c7eb458301ea36636c4dbb012bd88";
        let sig = x"cce72947906dbae4c166fc01fd096432784032be43db540909bc901dbc057992b4d655ca4f4355cf0868e1266baacf6919902969f063e74162f8f04bc4056105";
        
        if(!ed25519::verify(&sig, &pk, &msg)) {
            0
        } else {
            let msg_x = x"0acf638c029402d456b245edb834562ef60b3a7bf9abf647a06a01bc947d3ce1";
            let pk_x = x"6382c729be8d6c0b4306d88037b4658bcb31f5f33f50230da6b925c1b8dd5719";
            let sig_x = x"cd49245b49df24fa37a33e4a46b5720445d0c121b85dbfec795e0944d3ac9ec72dbd57d2ba400717011f818b5d040bd7696e3a447bf5965fb3c81f21a573f807";

            if(ed25519::verify(&sig_x, &pk_x, &msg_x)){
                1
            }else{
                2
            }
        }


        

        


    }


    // #[test]
    // public fun test_verifyfy(){
        
    //     // let pub_bytes = into_bytes(string::utf8(b"0x6382c729be8d6c0b4306d88037b4658bcb31f5f33f50230da6b925c1b8dd5719"));
    //     // let pub_key = hex::decode(&pub_bytes);

    //     // let b_bytes = into_bytes(string::utf8(b"0xeeef12db1a112cfdcdd4512533e1df68bd0612fcdec32780907b962e516f39c6bccc"));
    //     // let msg_bytes = hex::decode(&b_bytes);

    //     // let a_bytes = into_bytes(string::utf8(b"0x5a5d8d4f2039bce419eaddabba5d1a1f74c5cc51af2857ae5fa946a65ed37221ae7ce61990dc0793beb2c37eac9b96f56f48b180221788f786f85bb23f57f205"));
    //     // let signature_bytes = hex::decode(&a_bytes);

    //     let pk = x"6382c729be8d6c0b4306d88037b4658bcb31f5f33f50230da6b925c1b8dd5719";
    //     let msg = x"eeef12db1a112cfdcdd4512533e1df68bd0612fcdec32780907b962e516f39c6bccc";
    //     let signature = x"5a5d8d4f2039bce419eaddabba5d1a1f74c5cc51af2857ae5fa946a65ed37221ae7ce61990dc0793beb2c37eac9b96f56f48b180221788f786f85bb23f57f205";

    //     let result =  ed25519::verify(&signature,&pk,&msg);

    //     assert!(result, 1);
    // }

}
