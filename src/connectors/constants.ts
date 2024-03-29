import { getDefaultProvider } from 'ethers'

export const BLOCKS_PER_DAY = 15700

export const SMARTBCH_NODE_MAINNET = 'https://smartbch.fountainhead.cash/mainnet'
export const provider = () => getDefaultProvider(SMARTBCH_NODE_MAINNET)

export const MasterChefV2ABI = require('../abi/MasterChefV2.json')
export const UniswapV2ERC20ABI = require('../abi/UniswapV2ERC20.json')
export const UniswapV2PairABI = require('../abi/UniswapV2Pair.json')

export const MISTSWAP_POOL_DETAILS = require('../cache/mistswap/pool_details.json')
export const MISTSWAP_TOKEN_DETAILS = require('../cache/mistswap/token_details.json')

export const WBCH_ADDRESS = '0x3743eC0673453E5009310C727Ba4eaF7b3a1cc04'
export const FLEXUSD_ADDRESS = '0x7b2B3C5308ab5b2a1d9a94d20D35CCDf61e05b72'
export const MIST_ADDRESS = '0x5fA664f69c2A4A3ec94FaC3cBf7049BD9CA73129'
export const TANGO_ADDRESS = '0x73BE9c8Edf5e951c9a0762EA2b1DE8c8F38B5e91'

export const LPTOKEN_WBCH_FLEXUSD_ADDRESS = '0x24f011f12Ea45AfaDb1D4245bA15dCAB38B43D13'
export const LPTOKEN_MIST_FLEXUSD_ADDRESS = '0x437E444365aD9ed788e8f255c908bceAd5AEA645'
export const LPTOKEN_TANGO_FLEXUSD_ADDRESS = '0xf8534BB9603c501Bbe16deF7D08D941F0241855b'

export const TOKEN_TO_FLEXUSD_POOL_ADDRESS: Record<string, string> = {
  [WBCH_ADDRESS]: LPTOKEN_WBCH_FLEXUSD_ADDRESS,
  [MIST_ADDRESS]: LPTOKEN_MIST_FLEXUSD_ADDRESS,
  [TANGO_ADDRESS]: LPTOKEN_TANGO_FLEXUSD_ADDRESS,
}

export const TOKEN_TO_WBCH_POOL_ADDRESS = {}
