import { getDefaultProvider, Contract, utils } from 'ethers'

import {
  WBCH_ADDRESS, FLEXUSD_ADDRESS, MIST_ADDRESS,
  LPTOKEN_WBCH_FLEXUSD_ADDRESS, LPTOKEN_MIST_FLEXUSD_ADDRESS,
} from './addresses'

const UniswapV2ERC20ABI = require('../abi/UniswapV2ERC20.json')

const SMARTBCH_NODE_MAINNET = 'https://smartbch.fountainhead.cash/mainnet'

export const provider = () => getDefaultProvider(SMARTBCH_NODE_MAINNET)

export const getBCHPriceUSD = async () => {
  const activeProvider = provider()
  const BCHContract = new Contract(WBCH_ADDRESS, UniswapV2ERC20ABI, activeProvider)
  const FLEXUSDContract = new Contract(FLEXUSD_ADDRESS, UniswapV2ERC20ABI, activeProvider)

  const [ balanceOfBCH, balanceOfFlexUSD ] = await Promise.all([
    BCHContract.balanceOf(LPTOKEN_WBCH_FLEXUSD_ADDRESS),
    FLEXUSDContract.balanceOf(LPTOKEN_WBCH_FLEXUSD_ADDRESS),
  ])

  return balanceOfFlexUSD.div(balanceOfBCH)
}

export const getMISTPriceUSD = async () => {
  const activeProvider = provider()
  const MISTContract = new Contract(MIST_ADDRESS, UniswapV2ERC20ABI, activeProvider)
  const FLEXUSDContract = new Contract(FLEXUSD_ADDRESS, UniswapV2ERC20ABI, activeProvider)

  const [ balanceOfMIST, balanceOfFlexUSD ] = await Promise.all([
    MISTContract.balanceOf(LPTOKEN_MIST_FLEXUSD_ADDRESS),
    FLEXUSDContract.balanceOf(LPTOKEN_MIST_FLEXUSD_ADDRESS),
  ])

  return Number(utils.formatEther(balanceOfFlexUSD)) / Number(utils.formatEther(balanceOfMIST))
}

export const getTokenPriceUSD = async (tokenAddress: string) => {
  if (tokenAddress === WBCH_ADDRESS) {
    const ret = await getBCHPriceUSD()
    return ret.toNumber()
  } else if (tokenAddress === MIST_ADDRESS) {
    const ret = await getMISTPriceUSD()
    return ret
  } else if (tokenAddress === FLEXUSD_ADDRESS) {
    return 1
  }
  // Default value
  return 0
}
