# rooch-hook

##  How to use rooch hook

### 1. install ed25519-tool

```shell
cargo install --git https://github.com/v1xingyue/rooch-hook.git --branch  main
```

put your hook content to **.git/hooks/prepare-commit-msg**:

```shell
#!/bin/bash

COMMIT_MSG_FILE=$1
CUSTOM_SIGNATURE=$(sign-tool sign -f $COMMIT_MSG_FILE)

# Append the custom signature to the commit message
echo -e "\n$CUSTOM_SIGNATURE" >> "$COMMIT_MSG_FILE"

```

### 2. deploy your own contract about your github repo

```shell
cd github-event
rooch move publish --max-gas-amount 800000000
```

### 3. mint developer info

```shell
rooch move run --function default::developer::mint --args "String:v1xingyue" --args "String:6382c729be8d6c0b4306d88037b4658bcb31f5f33f50230da6b925c1b8dd5719"
```

also you can check developer info:

```shell
rooch resource --resource default::developer::DeveloperInfo --address default
```

### 4. change your github repo webhook url

That can be our public hook:

[https://rooch-hook.vercel.app/api/github/hooks/push](https://rooch-hook.vercel.app/api/github/hooks/push)

Subscribe your github repo webhook to our public hooks. It will help bring your github commit with sinature to the rooch.

### 5. some useful functions

- rooch move run --function default::developer::commit --args "String:repor_url" --args "String:commit_url" --args "String:commit message" --args 'raw:a17a7b477a' --args 'raw:a17a7b477a'

- rooch move view --function default::developer::verify_by_address --args address:rooch1qn5lf7hzzs086ysdxcsme3jn3d0jpf6ynm0x66880edhzxmkk86q0xtwcy --args String:5a5d8d4f2039bce419eaddabba5d1a1f74c5cc51af2857ae5fa946a65ed37221ae7ce61990dc0793beb2c37eac9b96f56f48b180221788f786f85bb23f57f205 --args String:eeef12db1a112cfdcdd4512533e1df68bd0612fcdec32780907b962e516f39c6bccc
- rooch move view --function default::developer::user_name --args address:default
- rooch move view --function default::developer::user_pub --args address:default
- rooch move view --function default::developer::user_pub_bytes --args address:default
- rooch move view --function default::developer::test_verify

...
