import { BigNumber, utils } from 'ethers'

import { WBCH_ADDRESS, provider } from './constants'
import { getMistSwapSummary } from './mistswapdex'
import { getTangoSwapSummary } from './tangoswapdex'
import { getOrRefreshTokenPrice } from './store'
import { IPortfolioSummary } from './types'



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
  const [ userWalletBalance, BCHPrice, mistSwapSummary, tangoSwapSummary ] = await Promise.all([
    getBalance(userAddress),
    getOrRefreshTokenPrice(WBCH_ADDRESS),
    getMistSwapSummary(userAddress),
    getTangoSwapSummary(userAddress),
  ])

  const totalPools = totalPoolsNetWorth(mistSwapSummary.pools) + totalPoolsNetWorth(tangoSwapSummary.pools)

  const netWorth = Number(
    totalPools
    +
    Number(utils.formatEther(userWalletBalance)) * BCHPrice
  )

  return {
    exchanges: [mistSwapSummary, tangoSwapSummary],
    balance: Number(utils.formatEther(userWalletBalance)) * BCHPrice, // in BCH
    BCHPrice: BCHPrice,
    netWorth: netWorth,
  }
}
