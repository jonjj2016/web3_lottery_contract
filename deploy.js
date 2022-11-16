const HDWalletProvider = require('@truffle/hdwallet-provider')
const Web3 = require('web3')
const fs = require('fs')
require('dotenv').config()

const biteCode = fs.readFileSync('./Contracts_Lottery_sol_Lottery.bin', 'utf-8')
const abiCode = fs.readFileSync('./Contracts_Lottery_sol_Lottery.abi', 'utf-8')

const provider = new HDWalletProvider(
  process.env.MNEUMONIC,
  process.env.RPC_URL,
)
const web3 = new Web3(provider)
const main = async () => {
  try {
    const accounts = await web3.eth.getAccounts()
    const contract = await new web3.eth.Contract(JSON.parse(abiCode))
      .deploy({
        data: biteCode,
        arguments: ['hello there'],
      })
      .send({ from: accounts[1], gas: '1000000' })
    console.log(
      'Contract has been deployed to this address: ',
      contract.options.address,
    )
    provider.engine.stop()
    process.exit()
  } catch (error) {
    console.log(error)
    process.exit(1)
  }
}
main()
