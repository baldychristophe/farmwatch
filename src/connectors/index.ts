import { getDefaultProvider, Contract } from 'ethers'
import { BigNumber } from 'ethers'

const UniswapV2PairABI = require('../abi/UniswapV2Pair.json')
const UniswapV2ERC20ABI = require('../abi/UniswapV2ERC20.json')

const SMARTBCH_NODE_MAINNET = 'https://smartbch.fountainhead.cash/mainnet'

export const provider = () => getDefaultProvider(SMARTBCH_NODE_MAINNET)

export const getBalance = (address: string) : Promise<BigNumber> => {
  return provider().getBalance(address)
}

export const getBCHPriceUSD = async () => {
  const LPTokenContractAddress = '0x24f011f12Ea45AfaDb1D4245bA15dCAB38B43D13'
  const LPTokenContract = new Contract(LPTokenContractAddress, UniswapV2PairABI, provider())
  const token0 = await LPTokenContract.token0()
  const token1 = await LPTokenContract.token1()

  const BCHContract = new Contract(token0, UniswapV2ERC20ABI, provider())
  const balanceOfBCH = await BCHContract.balanceOf(LPTokenContractAddress)

  const FLEXUSDContract = new Contract(token1, UniswapV2ERC20ABI, provider())
  const balanceOfFlexUSD = await FLEXUSDContract.balanceOf(LPTokenContractAddress)

  return balanceOfFlexUSD.div(balanceOfBCH)
}
