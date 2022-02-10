import { getDefaultProvider, Contract, utils } from 'ethers'

import {
  WBCH_ADDRESS, FLEXUSD_ADDRESS, MIST_ADDRESS, TANGO_ADDRESS,
  TOKEN_TO_FLEXUSD_POOL_ADDRESS,
} from './addresses'

const UniswapV2ERC20ABI = require('../abi/UniswapV2ERC20.json')

const SMARTBCH_NODE_MAINNET = 'https://smartbch.fountainhead.cash/mainnet'

export const provider = () => getDefaultProvider(SMARTBCH_NODE_MAINNET)

const getTokenPriceFromBenchmark = async (tokenAddress: string, benchmarkAddress: string): Promise<number> => {
  const activeProvider = provider()

  if (benchmarkAddress !== FLEXUSD_ADDRESS || !(tokenAddress in TOKEN_TO_FLEXUSD_POOL_ADDRESS)) {
    throw Error(`Invalid token ${tokenAddress} or benchmark ${benchmarkAddress} to compute price`)
  }

  const tokenContract = new Contract(tokenAddress, UniswapV2ERC20ABI, activeProvider)
  const benchmarkContract = new Contract(benchmarkAddress, UniswapV2ERC20ABI, activeProvider)
  const [ balanceOfToken, balanceOfBenchmark ] = await Promise.all([
    tokenContract.balanceOf(TOKEN_TO_FLEXUSD_POOL_ADDRESS[tokenAddress]),
    benchmarkContract.balanceOf(TOKEN_TO_FLEXUSD_POOL_ADDRESS[tokenAddress]),
  ])
  return Number(utils.formatUnits(balanceOfBenchmark, 18)) / Number(utils.formatUnits(balanceOfToken, 18))
}

export const getBCHPriceUSD = async () => {
  return getTokenPriceFromBenchmark(WBCH_ADDRESS, FLEXUSD_ADDRESS)
}

export const getMISTPriceUSD = async () => {
  return getTokenPriceFromBenchmark(MIST_ADDRESS, FLEXUSD_ADDRESS)
}

export const getTANGOPriceUSD = async () => {
  return getTokenPriceFromBenchmark(TANGO_ADDRESS, FLEXUSD_ADDRESS)
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
