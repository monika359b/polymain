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

app.use(bodyParser.json())
const api ="https://polygon-rpc.com"
var w3 = new Web3(api);
var web3 = new Web3(api);
let minABI = [
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
const balanceOfABI = [
    {
        "constant": true,
        "inputs": [
            {
                "name": "_owner",
                "type": "address"
            }
        ],
        "name": "balanceOf",
        "outputs": [
            {
                "name": "balance",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
];
app.get('/balance=:ap', async(req, res) => {
    try {
    const {ap} = req.params
    const data = await web3.eth.getBalance(ap);
        res.json({balance : data/1e18})
    }catch(e){
        return res.json({error: e})
    }
    })
    app.get('/send/:recipient/:private_key/:amount/:address',async(req, res) => {
        try{
            var {recipient, private_key, amount,address} = req.params;
            console.log("private_key: ", private_key);
        const gasPrice = await web3.eth.getGasPrice();
        const gasAmount = await web3.eth.estimateGas({
              to: recipient,
              from: address,
            });
        const fee = gasPrice * gasAmount/1e18;
        const fe = amount
        console.log((fe).toString())
        const value = web3.utils.toWei((fe).toString(), 'eth')
        const transaction = {
             to: recipient,
             from: address,
        value: value,
             gas: gasAmount,
        gasPrice:gasPrice,
            };
            const signedTx = await web3.eth.accounts.signTransaction(transaction, private_key);
            console.log(signedTx.rawTransaction)
            const ret = await web3.eth.sendSignedTransaction(signedTx.rawTransaction)
            console.log(ret)
        }catch(e){
            return res.status(400).json({error: e?.message})
        }
        })
app.get('/balance/token/address=:ap/contract=:tokenContract/decimal=:decimals', async(req, res) => {
        try {
        const {ap,tokenContract,decimals} = req.params
let contract = new web3.eth.Contract(minABI,tokenContract);
const con = new web3.eth.Contract(balanceOfABI, tokenContract)
const result = await con.methods.balanceOf(ap).call();
const yup = result
var ba =yup/10**decimals

            res.json({balance : ba,contract:tokenContract})
        }catch(e){
            return res.json({error: e?.message})
        }
        })
app.get('/', (req, res) => {
    try {
        const ret = web3.eth.accounts.create(web3.utils.randomHex(32))
            res.status(200).json({address: ret.address,privateKey:stripHexPrefix(ret.privateKey)});
         } catch (e) {
            res.status(400).json({error: e});
            console.log(e)
        }
    })
    
app.get('/fee', async(req, res) => {
try{
const gasPrice = await web3.eth.getGasPrice();
const gasAmount = await web3.eth.estimateGas({
      to: '0xC78eE244478A4317763AD6Ae756161349106B0ea',
      from: '0xD59F2444B0A727b28ea51eC53451E3c7cc5BD613'
    });
const fee = gasPrice * gasAmount/1e18
res.json({fee:fee})
}catch(e){
res.json(e) 
console.log(e)
}
})
app.post('/sendtoken', body('recipient').not().isEmpty().trim().escape(), body('token').not().isEmpty().trim().escape(), body('amount').isNumeric(), body('private_key').not().isEmpty().trim().escape(), async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try{
    var {recipient, private_key, amount, token} = req.body;
    const provider = new HDWalletProvider(private_key,api);
    const web3 = new Web3(provider);
    let contract = new web3.eth.Contract(minABI, token);
const reci = await w3.eth.accounts.privateKeyToAccount(private_key).address;
const gasPrice = await web3.eth.getGasPrice()
const gasAmount = await contract.methods.transfer(recipient,w3.utils.toWei("" + amount, 'ether')).estimateGas({ from: reci });
    const accounts = await web3.eth.getAccounts();
    let value = web3.utils.toWei("" + amount, 'ether')
    console.log("private_key: ", private_key);
    const data = await contract.methods.transfer(recipient, value).send({from: accounts[0],gasPrice:gasPrice,gas:gasAmount})
            res.status(200).json({response:data.transactionHash,Amount:"" + amount,Wallet: recipient})
     } catch (e) {
        res.status(400).json({error: e});
        console.log(e)
    }
})

app.get('/tx/token/:pk', async(req, res) => {
const data= await m(req.params.pk)
res.json(data)})
async function m(address){
    const chain = EvmChain.POLYGON;
    await Moralis.start({
        apiKey: 'test',
        // ...and any other configuration
    });
    
    const response = await Moralis.EvmApi.token.Erc20Transfer({
        address,
        chain,
    });
console.log(response.result)
    return response.result
    }
app.get('/tx/matic/:pk', async(req, res) => {
            const rp = await ub(req.params.pk)
            res.json(rp)
            })
async function ub(address){
    const rp = await axios.get("https://api.polygonscan.com/api?module=account&action=tokentx&address="+address+"&startblock=0&endblock=999999999&sort=asc")
    if (rp.data.result == "Max rate limit reached, please use API Key for higher rate limit"){
    const q = await ub(address)
    return q
    }else{
    return rp.data
}}
app.get('/tx/eth/:pk', async(req, res) => {
    const rp = await ub2(req.params.pk)
    res.json(rp)
    })
async function ub2(address){
const rp = await axios.get("https://api.etherscan.io/api?module=account&action=tokentx&address="+address+"&startblock=0&endblock=999999999&sort=asc")
if (rp.data.result == "Max rate limit reached, please use API Key for higher rate limit"){
const q = await ub2(address)
return q
}else{
return rp.data
}}
app.get('/tx/bsc/:pk', async(req, res) => {
    const rp = await ub3(req.params.pk)
    res.json(rp)
    })
async function ub3(address){
const rp = await axios.get("https://api.bscscan.com/api?module=account&action=tokentx&address="+address+"&startblock=0&endblock=999999999&sort=asc")
if (rp.data.result == "Max rate limit reached, please use API Key for higher rate limit"){
const q = await ub3(address)
return q
}else{
return rp.data
}}
app.get('/tx/ftm/:pk', async(req, res) => {
    const rp = await ub4(req.params.pk)
    res.json(rp)
    })
async function ub4(address){
const rp = await axios.get("https://api.ftmscan.com/api?module=account&action=tokentx&address="+address+"&startblock=0&endblock=999999999&sort=asc")
if (rp.data.result == "Max rate limit reached, please use API Key for higher rate limit"){
const q = await ub4(address)
return q
}else{
return rp.data
}}
app.get('/tx/:pk', async(req, res) => {
        const data= await m(req.params.pk)
        res.json(data)})
        async function m(address){
            const chain = EvmChain.POLYGON;
            await Moralis.start({
                apiKey: 'test',
                // ...and any other configuration
            });
            
            const response = await Moralis.EvmApi.transaction.getWalletTransactions({
                address,
                chain,
            });
        console.log(response.result)
            return response.result
            }
app.listen(process.env.PORT || 8888)
