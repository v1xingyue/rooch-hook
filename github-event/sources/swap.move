module github_event::swap {

    // use rooch_framework::gas_coin::RGas;
    // use github_event::rhec_coin::{Self, RHEC};
    use moveos_std::object::Object;
    use rooch_framework::coin_store::{Self, CoinStore,balance};
    use moveos_std::account;
    use rooch_framework::account_coin_store::{Self};
    use moveos_std::signer;

    const ERR_POOL_EXISTS: u64 = 1;
    const ERR_POOL_NOT_EXISTS: u64 = 2;

    struct Pool<phantom CoinTypeA: key + store, phantom CoinTypeB: key + store> has key {
        coin_a_store: Object<CoinStore<CoinTypeA>>,
        coin_b_store: Object<CoinStore<CoinTypeB>>,
    }

    public entry fun init_pool<CoinTypeA: key + store, CoinTypeB: key + store>(sender: &signer,amount_a: u256, amount_b: u256) {
        assert!(!account::exists_resource<Pool<CoinTypeA, CoinTypeB>>(@github_event), ERR_POOL_EXISTS);
        let pool = Pool<CoinTypeA, CoinTypeB>{
            coin_a_store: coin_store::create_coin_store<CoinTypeA>(),
            coin_b_store: coin_store::create_coin_store<CoinTypeB>(),
        };
        let coin_a = account_coin_store::withdraw<CoinTypeA>(sender, amount_a);
        let coin_b = account_coin_store::withdraw<CoinTypeB>(sender, amount_b);
        coin_store::deposit(&mut pool.coin_a_store, coin_a);
        coin_store::deposit(&mut pool.coin_b_store, coin_b);
        account::move_resource_to(&signer::module_signer<Pool<CoinTypeA, CoinTypeB>>(), pool);
    }

    public entry fun swap<CoinTypeA: key + store, CoinTypeB: key + store>(sender: &signer, amount_a: u256) {
        assert!(account::exists_resource<Pool<CoinTypeA, CoinTypeB>>(@github_event), ERR_POOL_NOT_EXISTS);
        let account_addr = signer::address_of(sender);
        let pool = account::borrow_mut_resource<Pool<CoinTypeA, CoinTypeB>>(@github_event);
        let coin_a = account_coin_store::withdraw<CoinTypeA>(sender, amount_a);
        // calculate the amount of coin b as uniswap v1
        let amount_b = calculate_amount_b(amount_a, pool);
        let coin_b = coin_store::withdraw(&mut pool.coin_b_store, amount_b);
        coin_store::deposit(&mut pool.coin_a_store, coin_a);
        account_coin_store::deposit(account_addr, coin_b);
    }

    public entry fun supply<CoinTypeA: key + store, CoinTypeB: key + store>(sender: &signer, amount_a: u256, amount_b: u256) {
        assert!(account::exists_resource<Pool<CoinTypeA, CoinTypeB>>(@github_event), ERR_POOL_NOT_EXISTS);
        let pool = account::borrow_mut_resource<Pool<CoinTypeA, CoinTypeB>>(@github_event);
        let coin_a = account_coin_store::withdraw<CoinTypeA>(sender, amount_a);
        let coin_b = account_coin_store::withdraw<CoinTypeB>(sender, amount_b);
        coin_store::deposit(&mut pool.coin_a_store, coin_a);
        coin_store::deposit(&mut pool.coin_b_store, coin_b);
    }

    fun calculate_amount_b<CoinTypeA: key + store, CoinTypeB: key + store>(amount_a: u256, pool: &Pool<CoinTypeA, CoinTypeB>) : u256 {
        let balance_a = balance<CoinTypeA>(&pool.coin_a_store);
        let balance_b = balance<CoinTypeB>(&pool.coin_b_store);
        // calculate amount_b as : balance_a * balance_b = (balnace_b - amount_b) * (balance_a - amount_a)
        let amount_b = balance_b * (balance_a - amount_a) / balance_a;
        amount_b
    }

}