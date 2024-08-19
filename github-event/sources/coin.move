module github_event::coin {

    use std::string;
    use moveos_std::signer;
    use moveos_std::object::{Self, Object};
    use rooch_framework::coin;
    use rooch_framework::coin_store::{Self, CoinStore};
    use rooch_framework::account_coin_store;
    
    const TOTAL_SUPPLY: u256 = 210_000_000_000u256;
    const DECIMALS: u8 = 1u8;
    
    struct GEC has key, store {}
    struct Treasury has key {
        coin_store: Object<CoinStore<GEC>>
    }

    fun init() {
        let coin_info_obj = coin::register_extend<GEC>(    
            string::utf8(b"Github Event Coin"),
            string::utf8(b"GEC"),
            DECIMALS,
        );
        let coin = coin::mint_extend<GEC>(&mut coin_info_obj, TOTAL_SUPPLY);
        object::to_frozen(coin_info_obj);
        let coin_store_obj = coin_store::create_coin_store<GEC>();
        coin_store::deposit(&mut coin_store_obj, coin);
        let treasury_obj = object::new_named_object(Treasury { coin_store: coin_store_obj });
        object::to_shared(treasury_obj);
    }
    
    public entry fun faucet(account: &signer, treasury_obj: &mut Object<Treasury>) {
        let account_addr = signer::address_of(account);
        let treasury = object::borrow_mut(treasury_obj);
        let coin = coin_store::withdraw(&mut treasury.coin_store, 10000);
        account_coin_store::deposit(account_addr, coin);
    }
    

}