module github_event::developer {

    use std::string::{String,into_bytes};
    use moveos_std::account;
    use moveos_std::table_vec;
    use moveos_std::table;
    use moveos_std::signer;
    use moveos_std::timestamp;
    use rooch_framework::ed25519;
    use moveos_std::hex;
    
    const E_REPO_EXIST : u64 = 1;
    const E_REPO_NOT_EXIST : u64 = 2;
    const E_COMMIT_VERIFY_FAILED: u64 = 3;
    const E_HOOK_NOT_REPO_OWNER: u64 = 4;

    struct Commit has store {
        commit_time : u64,
        message: String,
        commit_url: String,
        commit_user : String,
    }

    struct DeveloperInfo has key {
        name: String,
        signer_pub: vector<u8>,
    }

    struct AdminCap has key {}

    struct Repo has store {
        owner: address,
        repo_name: String,
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
        account::move_resource_to(signer, DeveloperInfo { name,signer_pub});
    }

    entry fun create_repo(signer:&signer,repo_url:String,repo_name:String){
        let repos = account::borrow_mut_resource<Repos>(@github_event); 
        assert!(!table::contains(&repos.repos, repo_url), E_REPO_EXIST);
        table::add(&mut repos.repos, repo_url, Repo { owner: signer::address_of(signer), repo_name, commits: table_vec::new() });
    }
    
    // only can be called by repo hook with his signer pub
    entry fun commit(signer:&signer,commit_address: address,repo_url:String,commit_url:String,message:String,commit_user:String,_signature:String,_msg_hash:String){
        assert!(verify_by_address(commit_address,_signature,_msg_hash), E_COMMIT_VERIFY_FAILED);
        let commit_time = timestamp::now_seconds();
        let repos = account::borrow_mut_resource<Repos>(@github_event);
        assert!(table::contains(&repos.repos, repo_url), E_REPO_NOT_EXIST);
        let repo = table::borrow_mut(&mut repos.repos, repo_url);
        assert!(repo.owner == signer::address_of(signer),E_HOOK_NOT_REPO_OWNER);
        table_vec::push_back(&mut repo.commits, Commit { commit_time,message,commit_url,commit_user});
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
