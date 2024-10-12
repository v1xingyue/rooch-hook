rooch move run --function default::developer::commit \
    --args "address:0x0e30025ccfcb7c5c786c2c54aec588edcf26e699bfa6244dffbe5f7b97d11f48" \
    --args "String:https://github.com/v1xingyue/rooch-hook-example" \
    --args "String:https://github.com/v1xingyue/rooch-hook-example/commit/1c47cad944e8a63c14b7e3afd14e69feadd50368" \
    --args "String:say hi again" \
    --args "String:v1xingyue" \
    --args "String:10e5b47bd023b7679d8a356c41471d65a86ee87d974bf8d662ab28654d6d5e683b6f2570f1f850974f7c0ba9fad40e62eba787f07dae871e57f33aae16da8e06" \
    --args "String:e11f3a028c3c1c7eaab15d06e4f22915f7e9dca3ef2bad9557a8dad75d6be755" 


rooch move run --function default::developer::assign_repo \
    --args "String:https://github.com/v1xingyue/rooch-hook-example" \
    --args "address:0x0e30025ccfcb7c5c786c2c54aec588edcf26e699bfa6244dffbe5f7b97d11f48" 
    
    