import { getDefaultProvider } from 'ethers'

const SMARTBCH_NODE_MAINNET = 'https://smartbch.fountainhead.cash/mainnet'

export const provider = () => getDefaultProvider(SMARTBCH_NODE_MAINNET)

export const getBalance = (address: string) => provider().getBalance(address)
