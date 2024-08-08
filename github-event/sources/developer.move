module github_event::devloper {

    use std::string::{Self, String};
    use moveos_std::account;

    struct DeveloperInfo has key {
        name: vector<u8>,
        signer_pub: vector<u8>,
    }

    entry fun mint(signer:&signer,name:vector<u8>,signer_pub:vector<u8>){
        account::move_resource_to(signer, DeveloperInfo { name,signer_pub});
    }

}
