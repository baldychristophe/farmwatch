import { getTokenPriceUSD } from './prices'
import { FLEXUSD_ADDRESS } from './constants'

type TokenPriceRecord = Record<string, number>

export const tokenPriceStore: TokenPriceRecord = {
  [FLEXUSD_ADDRESS]: 1,
}

export const getTokenPrice = (tokenAddress: string) => {
  if (tokenAddress in tokenPriceStore) {
    return tokenPriceStore[tokenAddress]
  }
  return null
}

export const setTokenPrice = (tokenAddress: string, tokenPrice: number) => {
  tokenPriceStore[tokenAddress] = tokenPrice
}

export const getOrRefreshTokenPrice = async (tokenAddress: string): Promise<number> => {
  if (tokenAddress in tokenPriceStore) {
    return tokenPriceStore[tokenAddress]
  }
  const price = await getTokenPriceUSD(tokenAddress)
  tokenPriceStore[tokenAddress] = price
  return price
}
