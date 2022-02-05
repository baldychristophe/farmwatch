import { getDefaultProvider, Contract, utils } from 'ethers'

import {
  WBCH_ADDRESS, FLEXUSD_ADDRESS, MIST_ADDRESS, TANGO_ADDRESS,
  LPTOKEN_WBCH_FLEXUSD_ADDRESS, LPTOKEN_MIST_FLEXUSD_ADDRESS, LPTOKEN_TANGO_FLEXUSD_ADDRESS,
} from './addresses'

const UniswapV2ERC20ABI = require('../abi/UniswapV2ERC20.json')

const SMARTBCH_NODE_MAINNET = 'https://smartbch.fountainhead.cash/mainnet'

export const provider = () => getDefaultProvider(SMARTBCH_NODE_MAINNET)

export const getBCHPriceUSD = async () => {
  const activeProvider = provider()
  const WBCHContract = new Contract(WBCH_ADDRESS, UniswapV2ERC20ABI, activeProvider)
  const FLEXUSDContract = new Contract(FLEXUSD_ADDRESS, UniswapV2ERC20ABI, activeProvider)

  const [ balanceOfWBCH, balanceOfFlexUSD ] = await Promise.all([
    WBCHContract.balanceOf(LPTOKEN_WBCH_FLEXUSD_ADDRESS),
    FLEXUSDContract.balanceOf(LPTOKEN_WBCH_FLEXUSD_ADDRESS),
  ])
  return Number(utils.formatUnits(balanceOfFlexUSD, 18)) / Number(utils.formatUnits(balanceOfWBCH, 18))
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

export const getTANGOPriceUSD = async () => {
  const activeProvider = provider()
  const TANGOContract = new Contract(TANGO_ADDRESS, UniswapV2ERC20ABI, activeProvider)
  const FLEXUSDContract = new Contract(FLEXUSD_ADDRESS, UniswapV2ERC20ABI, activeProvider)

  const [ balanceOfTANGO, balanceOfFlexUSD ] = await Promise.all([
    TANGOContract.balanceOf(LPTOKEN_TANGO_FLEXUSD_ADDRESS),
    FLEXUSDContract.balanceOf(LPTOKEN_TANGO_FLEXUSD_ADDRESS),
  ])

  return Number(utils.formatEther(balanceOfFlexUSD)) / Number(utils.formatEther(balanceOfTANGO))
}

export const getTokenPriceUSD = async (tokenAddress: string) => {
  if (tokenAddress === WBCH_ADDRESS) {
    const ret = await getBCHPriceUSD()
    return ret
  } else if (tokenAddress === MIST_ADDRESS) {
    const ret = await getMISTPriceUSD()
    return ret
  } else if (tokenAddress === TANGO_ADDRESS) {
    const ret = await getTANGOPriceUSD()
    return ret
  } else if (tokenAddress === FLEXUSD_ADDRESS) {
    return 1
  }
  // Default value
  return 0
}
