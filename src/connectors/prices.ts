import { Contract, utils } from 'ethers'

import {
  WBCH_ADDRESS, FLEXUSD_ADDRESS, MIST_ADDRESS, TANGO_ADDRESS,
  TOKEN_TO_FLEXUSD_POOL_ADDRESS, provider, MISTSWAP_TOKEN_DETAILS
} from './constants'

const UniswapV2ERC20ABI = require('../abi/UniswapV2ERC20.json')

export const getTokenPriceInBenchmarkTokenFromLiquidityPool = async (tokenAddress: string, benchmarkTokenAddress: string, liquidityPoolAddress: string): Promise<number> => {
  const activeProvider = provider()
  const benchmarkContract = new Contract(benchmarkTokenAddress, UniswapV2ERC20ABI, activeProvider)
  const tokenContract = new Contract(tokenAddress, UniswapV2ERC20ABI, activeProvider)

  const [ balanceOfBenchmark, benchmarkDecimals, balanceOftoken, tokenDecimals ] = await Promise.all([
    benchmarkContract.balanceOf(liquidityPoolAddress),
    benchmarkTokenAddress in MISTSWAP_TOKEN_DETAILS ? MISTSWAP_TOKEN_DETAILS[benchmarkTokenAddress].decimals : benchmarkContract.decimals(),
    tokenContract.balanceOf(liquidityPoolAddress),
    tokenAddress in MISTSWAP_TOKEN_DETAILS ? MISTSWAP_TOKEN_DETAILS[tokenAddress].decimals : tokenContract.decimals(),
  ])

  return Number(utils.formatUnits(balanceOftoken, tokenDecimals)) / Number(utils.formatUnits(balanceOfBenchmark, benchmarkDecimals))
}

const getTokenPriceFromBenchmark = async (tokenAddress: string, benchmarkTokenAddress: string): Promise<number> => {
  if (benchmarkTokenAddress !== FLEXUSD_ADDRESS || !(tokenAddress in TOKEN_TO_FLEXUSD_POOL_ADDRESS)) {
    throw Error(`Invalid token ${tokenAddress} or benchmark ${benchmarkTokenAddress} to compute price`)
  }
  return getTokenPriceInBenchmarkTokenFromLiquidityPool(
    tokenAddress,
    benchmarkTokenAddress,
    TOKEN_TO_FLEXUSD_POOL_ADDRESS[tokenAddress],
  )
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
