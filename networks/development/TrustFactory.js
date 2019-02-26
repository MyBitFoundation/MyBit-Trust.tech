export const ADDRESS = '0x57328E20CB87874cB571DCcC0f3195E9313f2700'; 
export const ABI = [
    {
        "constant": true,
        "inputs": [],
        "name": "expired",
        "outputs": [
            {
                "name": "",
                "type": "bool"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function",
        "signature": "0x4c2067c7"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "mybFee",
        "outputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function",
        "signature": "0x80cb11a6"
    },
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
        "name": "mybBurner",
        "outputs": [
            {
                "name": "",
                "type": "address"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function",
        "signature": "0xef9fa23c"
    },
    {
        "inputs": [
            {
                "name": "_mybTokenBurner",
                "type": "address"
            }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "constructor",
        "signature": "constructor"
    },
    {
        "payable": true,
        "stateMutability": "payable",
        "type": "fallback"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "name": "_trustor",
                "type": "address"
            },
            {
                "indexed": true,
                "name": "_beneficiary",
                "type": "address"
            },
            {
                "indexed": false,
                "name": "_trustAddress",
                "type": "address"
            },
            {
                "indexed": false,
                "name": "_amount",
                "type": "uint256"
            }
        ],
        "name": "LogNewTrust",
        "type": "event",
        "signature": "0x693384e1ab379d22cb2a64d90d94ef5ae0464a1582c357aa38cb40c04930c67a"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "name": "_trustor",
                "type": "address"
            },
            {
                "indexed": true,
                "name": "_beneficiary",
                "type": "address"
            },
            {
                "indexed": false,
                "name": "_trustAddress",
                "type": "address"
            }
        ],
        "name": "LogNewTrustERC20",
        "type": "event",
        "signature": "0x79272e4b4e78746822c5edf64ff0318b76c0740ef55ccac1dc7a3f63d2367fa4"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "name": "_trustor",
                "type": "address"
            },
            {
                "indexed": true,
                "name": "_beneficiary",
                "type": "address"
            },
            {
                "indexed": false,
                "name": "_trustAddress",
                "type": "address"
            }
        ],
        "name": "LogNewTrustERC721",
        "type": "event",
        "signature": "0x9003de4faa116c5cf141e0b2f34b82c6178a7a08ef0d0e835677d003a3b54a97"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "name": "_oldFee",
                "type": "uint256"
            },
            {
                "indexed": false,
                "name": "_newFee",
                "type": "uint256"
            }
        ],
        "name": "LogMYBFeeChange",
        "type": "event",
        "signature": "0x335805f4e6fab172c9ec930ef512eab0affc6a0f0c672642b83ecf379b39866d"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "_beneficiary",
                "type": "address"
            },
            {
                "name": "_revokeable",
                "type": "bool"
            },
            {
                "name": "_expiration",
                "type": "uint256"
            },
            {
                "name": "_burnToken",
                "type": "address"
            }
        ],
        "name": "deployTrust",
        "outputs": [],
        "payable": true,
        "stateMutability": "payable",
        "type": "function",
        "signature": "0x8a3ffe93"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "_beneficiary",
                "type": "address"
            },
            {
                "name": "_revokeable",
                "type": "bool"
            },
            {
                "name": "_expiration",
                "type": "uint256"
            },
            {
                "name": "_tokenContractAddress",
                "type": "address"
            },
            {
                "name": "_burnToken",
                "type": "address"
            }
        ],
        "name": "createTrustERC20",
        "outputs": [],
        "payable": true,
        "stateMutability": "payable",
        "type": "function",
        "signature": "0x9214964f"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "_beneficiary",
                "type": "address"
            },
            {
                "name": "_revokeable",
                "type": "bool"
            },
            {
                "name": "_expiration",
                "type": "uint256"
            },
            {
                "name": "_tokenContractAddress",
                "type": "address"
            },
            {
                "name": "_burnToken",
                "type": "address"
            }
        ],
        "name": "createTrustERC721",
        "outputs": [],
        "payable": true,
        "stateMutability": "payable",
        "type": "function",
        "signature": "0xf51f5ba5"
    },
    {
        "constant": false,
        "inputs": [],
        "name": "closeFactory",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function",
        "signature": "0xd1dff3ab"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "_newFee",
                "type": "uint256"
            }
        ],
        "name": "changeMYBFee",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function",
        "signature": "0x8871c163"
    }
];