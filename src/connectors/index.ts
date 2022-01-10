import { getDefaultProvider } from 'ethers'
import { BigNumber, utils } from 'ethers'

import { getTokenPriceUSD, getMistSwapSummary } from './mistswapdex'
import { IPortfolioSummary } from './types'

const SMARTBCH_NODE_MAINNET = 'https://smartbch.fountainhead.cash/mainnet'

export const provider = () => getDefaultProvider(SMARTBCH_NODE_MAINNET)

export const getBalance = (userAddress: string) : Promise<BigNumber> => {
  return provider().getBalance(userAddress)
}

const totalPoolsNetWorth = (pools: any): number => {
  let accumaltionValue = 0
  for (const pool of pools) {
    accumaltionValue += pool.token0.value + pool.token1.value
  }
  return accumaltionValue
}

export const getPortfolioSummary = async (userAddress: string) : Promise<IPortfolioSummary> => {
  const [ userWalletBalance, BCHPrice, mistSwapSummary ] = await Promise.all([
    getBalance(userAddress),
    getTokenPriceUSD('0x3743eC0673453E5009310C727Ba4eaF7b3a1cc04'), // WBCH
    getMistSwapSummary(userAddress),
  ])

  const totalPools = totalPoolsNetWorth(mistSwapSummary)

  const netWorth = Number(
    totalPools
    +
    Number(utils.formatEther(userWalletBalance)) * BCHPrice
  )

  return {
    dexList: [{ name: 'Mistswap', pools: mistSwapSummary }],
    balance: Number(utils.formatEther(userWalletBalance)) * BCHPrice, // in BCH
    BCHPrice: BCHPrice,
    netWorth: netWorth,
  }
}
