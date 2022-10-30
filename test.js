const express = require('express');
const Web3 = require('web3');
const Moralis = require('moralis').default;
const { EvmChain } = require('@moralisweb3/evm-utils');
const axios = require('axios').default;
const stripHexPrefix = require('strip-hex-prefix');
const bodyParser = require('body-parser');
const { body, validationResult } = require('express-validator');
const HDWalletProvider = require('@truffle/hdwallet-provider');
const app = express();
let abi = [
    // transfer
    {
     "constant": false,
     "inputs": [
      {
       "name": "_to",
       "type": "address"
      },
      {
       "name": "_value",
       "type": "uint256"
      }
     ],
     "name": "transfer",
     "outputs": [
      {
       "name": "",
       "type": "bool"
      }
     ],
     "type": "function"
    }
   ];
app.use(bodyParser.json())
const api ="https://polygon-rpc.com"
var w3 = new Web3(api);
var web3 = new Web3(api);
var instance = new web3.eth.Contract(abi,"0xcbf4ab00b6aa19b4d5d29c7c3508b393a1c01fe3");
var blockNo = web3.eth.blockNumber;
console.log('latest block', blockNo); //able to get blockNo successfully

var result = web3.eth.instance.allEvents().get(function(error, logs) {
            assert(error === null);
            for (let i = 0; i < logs.length; i++) {
                if (logs[i].event == 'Transfer' && logs[i].args.from == '0xaa8bbefc6773a45573059683e760752988abacc8') {
                    console.log(logs[i]);
                }
            }
        });
        