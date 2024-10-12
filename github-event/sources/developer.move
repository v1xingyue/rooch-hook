module github_event::developer {

    use std::string::{String,into_bytes};
    use moveos_std::account;
    use moveos_std::table_vec;
    use moveos_std::table;
    use moveos_std::signer;
    use moveos_std::timestamp;
    use rooch_framework::ed25519;
    use moveos_std::hex;
    use github_event::rhec_coin;
    use moveos_std::event;
    
    const E_REPO_EXIST : u64 = 1;
    const E_REPO_NOT_EXIST : u64 = 2;
    const E_COMMIT_VERIFY_FAILED: u64 = 3;
    const E_HOOK_NOT_REPO_OWNER: u64 = 4;

    const EVENT_TYPE_COMMIT: u8 = 1;
    const EVENT_TYPE_MINT_DEVELOPER : u8 = 2;
    const EVENT_TYPE_UPDATE_DEVELOPER : u8 = 3;

    struct DeveloperEvent has drop,copy {
        event_type: u8,
        address: address,
        msg: String,
        rhec_value: u64
    }

    fun trigger_event(event_type: u8,address: address,msg: String,rhec_value: u64) {
        event::emit(DeveloperEvent{
            event_type,
            address,
            msg,
            rhec_value
        });
    }

    struct Commit has store {
        commit_address: address,
        commit_time : u64,
        message: String,
        commit_url: String,
        commit_user : String,
    }

    struct DeveloperInfo has key {
        name: String,
        signer_pub: vector<u8>,
        register_time: u64,
        last_active_time: u64,
    }

    struct AdminCap has key {}

    struct Repo has store {
        owner: address,
        repo_name: String,
        repo_url: String,
        commits: table_vec::TableVec<Commit>,
    }

    struct Repos has key { 
        repos: table::Table<String,Repo>
    }

    fun init(){
        let signer = moveos_std::signer::module_signer<Repos>();
        account::move_resource_to(&signer, Repos { repos: table::new() });
        account::move_resource_to(&signer, AdminCap {});
    }

    entry fun mint_developer(signer:&signer,name:String,signer_pub:vector<u8>){
        let now = timestamp::now_seconds();
        account::move_resource_to(signer, DeveloperInfo { name,signer_pub,register_time: now,last_active_time: now});
        trigger_event(EVENT_TYPE_MINT_DEVELOPER,signer::address_of(signer),name,0);
        rhec_coin::mint_to(signer, 20_000);
    }

    entry fun update_developer_info(signer:&signer,name:String,signer_pub:vector<u8>){
        let dev_info = account::borrow_mut_resource<DeveloperInfo>(signer::address_of(signer));
        dev_info.name = name;
        dev_info.signer_pub = signer_pub;
        trigger_event(EVENT_TYPE_UPDATE_DEVELOPER,signer::address_of(signer),name,0);
    }

    entry fun update_or_mint(signer:&signer,name:String,signer_pub:vector<u8>){
        if(account::exists_resource<DeveloperInfo>(signer::address_of(signer))){
            update_developer_info(signer,name,signer_pub);
        }else{
            mint_developer(signer,name,signer_pub);
        }
    }

    entry fun create_repo(signer:&signer,repo_url:String,repo_name:String){
        let create_repo_cost: u256 = 10_000;
        let repos = account::borrow_mut_resource<Repos>(@github_event); 
        assert!(!table::contains(&repos.repos, repo_url), E_REPO_EXIST);
        table::add(&mut repos.repos, repo_url, Repo { owner: signer::address_of(signer), repo_name, commits: table_vec::new(),repo_url});
        rhec_coin::deposit_to_treasury(signer, create_repo_cost);
    }
    
    // only can be called by repo hook with his signer pub
    entry fun commit(signer:&signer,commit_address: address,repo_url:String,commit_url:String,message:String,commit_user:String,_signature:String,_msg_hash:String){
        assert!(verify_by_address(commit_address,_signature,_msg_hash), E_COMMIT_VERIFY_FAILED);
        let commit_time = timestamp::now_seconds();
        let repos = account::borrow_mut_resource<Repos>(@github_event);
        assert!(table::contains(&repos.repos, repo_url), E_REPO_NOT_EXIST);
        let repo = table::borrow_mut(&mut repos.repos, repo_url);
        assert!(repo.owner == signer::address_of(signer),E_HOOK_NOT_REPO_OWNER);
        table_vec::push_back(&mut repo.commits, Commit { commit_time,message,commit_url,commit_user,commit_address});

        if (rhec_coin::get_treasury_balance() > 0) {
            rhec_coin::mint_to(signer, 1000);
            let dev_info = account::borrow_mut_resource<DeveloperInfo>(signer::address_of(signer));
            dev_info.last_active_time = timestamp::now_seconds();
        };
    }

    entry fun update_pub(signer:&signer,signer_pub:vector<u8>){
        let dev_info = account::borrow_mut_resource<DeveloperInfo>(signer::address_of(signer));
        dev_info.signer_pub = signer_pub;
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
