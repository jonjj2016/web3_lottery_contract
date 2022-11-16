const assert = require('assert')
const ganache = require('ganache')
const Web3 = require('web3')
const fs = require('fs')

const web3 = new Web3(ganache.provider())

const abi = fs.readFileSync('./Contracts_Lottery_sol_Lottery.abi', 'utf-8')
const biteCode = fs.readFileSync('./Contracts_Lottery_sol_Lottery.bin', 'utf-8')

let accounts
let lottery
beforeEach(async () => {
  // Get a list of all accounts
  // use one of those accounts to deploy the contract
  accounts = await web3.eth.getAccounts()

  lottery = await new web3.eth.Contract(JSON.parse(abi))
    .deploy({
      data: biteCode,
    })
    .send({ from: accounts[0], gas: '1000000' })
})

describe('Lottery Contract test', () => {
  it('deploying contract', () => {
    assert.ok(lottery.options.address)
  })
  const moneyEnough = web3.utils.toWei('2', 'ether')
  it('join Lottery with single user', async () => {
    await lottery.methods.join().send({
      from: accounts[1],
      value: moneyEnough,
      gas: '1000000',
    })
    const players = await lottery.methods.participants().call({
      from: accounts[0],
    })
    assert.equal(1, players.length)
    assert.equal(players[0], accounts[1])
  })
  it('join Lottery with multiple users', async () => {
    await lottery.methods
      .join()
      .send({ from: accounts[1], value: moneyEnough, gas: '1000000' })
    await lottery.methods
      .join()
      .send({ from: accounts[2], value: moneyEnough, gas: '1000000' })
    await lottery.methods
      .join()
      .send({ from: accounts[3], value: moneyEnough, gas: '1000000' })
    const players = await lottery.methods.participants().call({
      from: accounts[0],
    })
    assert.equal(3, players.length)
    assert.equal(players[0], accounts[1])
    assert.equal(players[1], accounts[2])
    assert.equal(players[2], accounts[3])
  })
  it('Requires minimum amount of ether', async () => {
    try {
      await lottery.methods.join().send({
        from: accounts[1],
        value: 200,
        gas: '1000000',
      })
      assert(false)
    } catch (error) {
      assert(error)
    }
  })
  it('Only manager can pick winner', async () => {
    try {
      await lottery.methods
        .join()
        .send({ from: accounts[2], value: moneyEnough, gas: '1000000' })
      await lottery.methods.pickWinner().send({
        from: accounts[1],
        gas: '1000000',
      })
      assert(false)
    } catch (error) {
      assert(error)
    }
  })
  it('Sending funds to winner', async () => {
    await lottery.methods
      .join()
      .send({ from: accounts[2], value: moneyEnough, gas: '1000000' })
    const initialBallance = await web3.eth.getBalance(accounts[2])
    await lottery.methods.pickWinner().send({
      from: accounts[0],
      gas: '10000000',
    })
    const finalBalance = await web3.eth.getBalance(accounts[2])
    const difference = finalBalance - initialBallance
    assert(difference > web3.utils.toWei('1.8', 'ether'))
    assert(difference <= web3.utils.toWei('2', 'ether'))
  })
})
