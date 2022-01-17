import { getTokenPriceUSD } from './prices'

type TokenPriceRecord = Record<string, any>


export const tokenPriceStore = {} as TokenPriceRecord

export const getOrRefreshTokenPrice = (tokenAddress: string) => {
  if (tokenAddress in tokenPriceStore) {
    return tokenPriceStore[tokenAddress]
  }
  const price = getTokenPriceUSD(tokenAddress)
  tokenPriceStore[tokenAddress] = price
  return price
}
