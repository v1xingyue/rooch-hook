module github_event::rhec_coin {

    use std::string;
    use moveos_std::signer;
    use moveos_std::object::{Self, Object};
    use rooch_framework::coin;
    use rooch_framework::coin_store::{Self, CoinStore,balance};
    use rooch_framework::account_coin_store;
    use moveos_std::account;
    
    const TOTAL_SUPPLY: u256 = 2_000_000_000_000u256;
    const DECIMALS: u8 = 3u8;

    const E_NO_BALANCE: u64 = 1;
    
    struct RHEC has key, store {}
    struct Treasury has key {
        coin_store: Object<CoinStore<RHEC>>
    }

    fun init() {
        let coin_info_obj = coin::register_extend<RHEC>(    
            string::utf8(b"Rooch Hook Event Coin"),
            string::utf8(b"RHEC"),
            DECIMALS,
        );
        let coin = coin::mint_extend<RHEC>(&mut coin_info_obj, TOTAL_SUPPLY);
        object::to_frozen(coin_info_obj);
        let coin_store_obj = coin_store::create_coin_store<RHEC>();
        coin_store::deposit(&mut coin_store_obj, coin);
        let treasury_obj = Treasury { coin_store: coin_store_obj };
        account::move_resource_to(&signer::module_signer<Treasury>(), treasury_obj);
    }
    
    public fun get_treasury_balance() : u256 {
        let treasury_obj = account::borrow_resource<Treasury>(@github_event);
        balance<RHEC>(&treasury_obj.coin_store)
    }
    
    public entry fun mint_to(account: &signer,amount: u256) {
        let treasury_mut = account::borrow_mut_resource<Treasury>(@github_event);
        assert!(get_treasury_balance() > 0, E_NO_BALANCE);
        let account_addr = signer::address_of(account);
        let coin = coin_store::withdraw(&mut treasury_mut.coin_store, amount);
        account_coin_store::deposit(account_addr, coin);
    }

}