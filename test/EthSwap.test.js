const { assert } = require('chai')
const { default: Web3 } = require('web3')

const Token = artifacts.require('Token')
const EthSwap = artifacts.require('EthSwap')

require('chai').use(require('chai-as-promised')).should()

function tokens (n) {
    return web3.utils.toWei(n , 'ether')
}

contract ('EthSwap' , ([deployer , investor]) => {
    let token , ethSwap

    before(async () => {
        token = await Token.new()
        ethSwap = await EthSwap.new(token.address)

        await token.transfer(ethSwap.address , tokens('1000000'))
    })

    describe('EthSwap deployment' , async () => {
        it ('contract has a name' , async () => {
            const name = await ethSwap.name()
            assert.equal(name , 'EthSwap Instant Exchange')
        })
        it ('contract has tokens' , async () => {
            let balance = await token.balanceOf(ethSwap.address)
            assert.equal(balance.toString() , tokens('1000000'))
        })  
    })

    describe('BuyTokens()' , async () => {
        let result 
        before (async () => {
            result = await ethSwap.buyTokens({from : investor , value : web3.utils.toWei('1' , 'ether')})
        })

        it ('Allow user to instantly purchase token for a fixed price' , async () => {
            let investorBalnce = await token.balanceOf(investor)
            assert.equal(investorBalnce.toString() , tokens('100'))

            let ethSwapBalance
            ethSwapBalance = await token.balanceOf(ethSwap.address)
            assert.equal(ethSwapBalance.toString() , tokens('999900'))
            ethSwapBalance = await web3.eth.getBalance(ethSwap.address)
            assert.equal(ethSwapBalance , web3.utils.toWei('1' , 'Ether'))

            const event = result.logs[0].args;
            assert.equal(event.account , investor)
            assert.equal(event.token , token.address)
            assert.equal(event.amount.toString() , tokens('100').toString())
            assert.equal(event.rate.toString() , '100')
        }) 
    })
}) 