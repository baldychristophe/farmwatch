import { getDefaultProvider } from 'ethers'
import { BigNumber, utils } from 'ethers'

import { WBCH_ADDRESS, MIST_ADDRESS } from './addresses'
import { getMistSwapSummary } from './mistswapdex'
import { getOrRefreshTokenPrice } from './store'
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
  const [ userWalletBalance, BCHPrice, MistPrice, mistSwapSummary ] = await Promise.all([
    getBalance(userAddress),
    getOrRefreshTokenPrice(WBCH_ADDRESS),
    getOrRefreshTokenPrice(MIST_ADDRESS),
    getMistSwapSummary(userAddress),
  ])

  const totalPools = totalPoolsNetWorth(mistSwapSummary)

  const netWorth = Number(
    totalPools
    +
    Number(utils.formatEther(userWalletBalance)) * BCHPrice
  )

  return {
    dexList: [{
      name: 'Mistswap',
      pools: mistSwapSummary,
      logoUrl: 'https://assets.mistswap.fi/blockchains/smartbch/assets/0x5fA664f69c2A4A3ec94FaC3cBf7049BD9CA73129/logo.png',
      token: {
        name: 'Mist',
        price: MistPrice,
      }
    }],
    balance: Number(utils.formatEther(userWalletBalance)) * BCHPrice, // in BCH
    BCHPrice: BCHPrice,
    netWorth: netWorth,
  }
}
