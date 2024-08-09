hello world

change x add signer

? test build xxxx

0. rooch move run --function default::developer::mint --args "String:v1xingyue" --args "String:6382c729be8d6c0b4306d88037b4658bcb31f5f33f50230da6b925c1b8dd5719"
1. rooch resource --resource default::developer::DeveloperInfo --address default
2. rooch move run --function default::developer::commit --args "String:repor_url" --args "String:commit_url" --args "String:commit message" --args 'raw:a17a7b477a' --args 'raw:a17a7b477a'

3. rooch move view --function default::developer::verify_by_address --args address:rooch1qn5lf7hzzs086ysdxcsme3jn3d0jpf6ynm0x66880edhzxmkk86q0xtwcy --args String:5a5d8d4f2039bce419eaddabba5d1a1f74c5cc51af2857ae5fa946a65ed37221ae7ce61990dc0793beb2c37eac9b96f56f48b180221788f786f85bb23f57f205 --args String:eeef12db1a112cfdcdd4512533e1df68bd0612fcdec32780907b962e516f39c6bccc

4. rooch move view --function default::developer::user_name --args address:default
5. rooch move view --function default::developer::user_pub --args address:default
6. rooch move view --function default::developer::user_pub_bytes --args address:default

7. rooch move view --function default::developer::test_verify
