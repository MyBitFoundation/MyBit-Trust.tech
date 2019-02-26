export const ADDRESS = '0x83531556471a720Bea45F3dE8daB27b2f910C129'; 
export const ABI = [
    {
        "constant": true,
        "inputs": [],
        "name": "owner",
        "outputs": [
            {
                "name": "",
                "type": "address"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function",
        "signature": "0x8da5cb5b"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "kyber",
        "outputs": [
            {
                "name": "",
                "type": "address"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function",
        "signature": "0xa2d10ba5"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "mybToken",
        "outputs": [
            {
                "name": "",
                "type": "address"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function",
        "signature": "0xbdad900d"
    },
    {
        "constant": true,
        "inputs": [
            {
                "name": "",
                "type": "address"
            }
        ],
        "name": "authorizedBurner",
        "outputs": [
            {
                "name": "",
                "type": "bool"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function",
        "signature": "0xeac0448d"
    },
    {
        "inputs": [
            {
                "name": "_myBitTokenAddress",
                "type": "address"
            },
            {
                "name": "_kyberAddress",
                "type": "address"
            }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "constructor",
        "signature": "constructor"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "name": "_tokenHolder",
                "type": "address"
            },
            {
                "indexed": true,
                "name": "_burningContract",
                "type": "address"
            },
            {
                "indexed": false,
                "name": "_amount",
                "type": "uint256"
            }
        ],
        "name": "LogMYBBurned",
        "type": "event",
        "signature": "0xc87395c9a7116ce3ca8faa3215953102d6de8710810272a66800b11bbb588aa6"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "name": "_owner",
                "type": "address"
            },
            {
                "indexed": false,
                "name": "_burningContract",
                "type": "address"
            }
        ],
        "name": "LogBurnerAuthorized",
        "type": "event",
        "signature": "0xeac9f8ba2060889a150970f57c3dc197c983f39a315533d66c967fcdcb6c14f3"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "name": "_owner",
                "type": "address"
            },
            {
                "indexed": false,
                "name": "_burningContract",
                "type": "address"
            }
        ],
        "name": "LogBurnerRemoved",
        "type": "event",
        "signature": "0xecd371131643ad82a1ff7354a1c2c90d3f05c2b4eddec9c137d8f546922edb4f"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "name": "src",
                "type": "address"
            },
            {
                "indexed": false,
                "name": "amount",
                "type": "uint256"
            },
            {
                "indexed": false,
                "name": "dest",
                "type": "address"
            },
            {
                "indexed": false,
                "name": "receiver",
                "type": "address"
            },
            {
                "indexed": false,
                "name": "max",
                "type": "uint256"
            },
            {
                "indexed": false,
                "name": "minRate",
                "type": "uint256"
            },
            {
                "indexed": false,
                "name": "walletID",
                "type": "address"
            }
        ],
        "name": "LogTrade",
        "type": "event",
        "signature": "0xa128b2b1a4d54009d705dd70a0f79ecdb40e4c338e484124fa54ace8c2a7acf3"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "_tokenHolder",
                "type": "address"
            },
            {
                "name": "_amount",
                "type": "uint256"
            },
            {
                "name": "_burnToken",
                "type": "address"
            }
        ],
        "name": "burn",
        "outputs": [
            {
                "name": "",
                "type": "bool"
            }
        ],
        "payable": true,
        "stateMutability": "payable",
        "type": "function",
        "signature": "0xb8ce670d"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "_burningContract",
                "type": "address"
            }
        ],
        "name": "authorizeBurner",
        "outputs": [
            {
                "name": "",
                "type": "bool"
            }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function",
        "signature": "0x34376ca0"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "_burningContract",
                "type": "address"
            }
        ],
        "name": "removeBurner",
        "outputs": [
            {
                "name": "",
                "type": "bool"
            }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function",
        "signature": "0x02846858"
    }
];