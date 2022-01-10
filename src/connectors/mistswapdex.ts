import { getDefaultProvider, Contract } from 'ethers'
import { BigNumber, utils } from 'ethers'

import { ChainId, MASTERCHEF_ADDRESS } from '@mistswapdex/sdk'

const MasterChefV2ABI = require('../abi/MasterChefV2.json')
const UniswapV2ERC20ABI = require('../abi/UniswapV2ERC20.json')
const UniswapV2PairABI = require('../abi/UniswapV2Pair.json')

const SMARTBCH_NODE_MAINNET = 'https://smartbch.fountainhead.cash/mainnet'

const WBCH_ADDRESS = '0x3743eC0673453E5009310C727Ba4eaF7b3a1cc04'
const FLEXUSD_ADDRESS = '0x7b2B3C5308ab5b2a1d9a94d20D35CCDf61e05b72'
const MIST_ADDRESS = '0x5fA664f69c2A4A3ec94FaC3cBf7049BD9CA73129'

const LPTOKEN_WBCH_FLEXUSD_ADDRESS = '0x24f011f12Ea45AfaDb1D4245bA15dCAB38B43D13'
const LPTOKEN_MIST_FLEXUSD_ADDRESS = '0x437E444365aD9ed788e8f255c908bceAd5AEA645'

export const provider = () => getDefaultProvider(SMARTBCH_NODE_MAINNET)

export const getBCHPriceUSD = async () => {
  const activeProvider = provider()
  const BCHContract = new Contract(WBCH_ADDRESS, UniswapV2ERC20ABI, activeProvider)
  const FLEXUSDContract = new Contract(FLEXUSD_ADDRESS, UniswapV2ERC20ABI, activeProvider)

  const [ balanceOfBCH, balanceOfFlexUSD ] = await Promise.all([
    BCHContract.balanceOf(LPTOKEN_WBCH_FLEXUSD_ADDRESS),
    FLEXUSDContract.balanceOf(LPTOKEN_WBCH_FLEXUSD_ADDRESS),
  ])

  return balanceOfFlexUSD.div(balanceOfBCH)
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

export const getTokenPriceUSD = async (tokenAddress: string) => {
  if (tokenAddress === WBCH_ADDRESS) {
    const ret = await getBCHPriceUSD()
    return ret.toNumber()
  } else if (tokenAddress === MIST_ADDRESS) {
    const ret = await getMISTPriceUSD()
    return ret
  } else if (tokenAddress === FLEXUSD_ADDRESS) {
    return 1
  }
  // Default value
  return 1
}

export const getActiveMistSwapPools = async (userAddress: string) => {
  const activeProvider = provider()
  const masterChefContract = new Contract(MASTERCHEF_ADDRESS[ChainId.SMARTBCH], MasterChefV2ABI, activeProvider)
  const poolLength = await masterChefContract.poolLength()

  const poolInfos = await Promise.all(
    Array.from({ length: poolLength }, (_, poolIndex) => masterChefContract.userInfo(poolIndex, userAddress))
  )
  return poolInfos
  .map((poolInfo, index) => ({ index, poolInfo })) // Add the index
  .filter(
    (pool: { poolInfo: { amount: BigNumber, rewardDebt: BigNumber }, index: number }) => !pool.poolInfo.amount.isZero()
  )
}

export const getPoolDetails = (poolIndex: number) => {
  const activeProvider = provider()
  const masterChefContract = new Contract(MASTERCHEF_ADDRESS[ChainId.SMARTBCH], MasterChefV2ABI, activeProvider)
  return masterChefContract.poolInfo(poolIndex)
}

export const getV2PairSummary = (poolAddress: string) => {
  const activeProvider = provider()
  const LPTokenPoolContract = new Contract(poolAddress, UniswapV2PairABI, activeProvider)
  return Promise.all([
    LPTokenPoolContract.name(),
    LPTokenPoolContract.token0(),
    LPTokenPoolContract.token1(),
    LPTokenPoolContract.symbol(),
    LPTokenPoolContract.totalSupply(),
  ])
}

export const getMistSwapSummary = async (userAddress: string) => {
  const activeProvider = provider()
  const activePools = await getActiveMistSwapPools(userAddress)

  const activePoolsWithDetails = await Promise.all(activePools.map(async (pool) => {
    let poolDetails = await getPoolDetails(pool.index)
    let [poolName, token0, token1, symbol, totalSupply] = await getV2PairSummary(poolDetails.lpToken)

    const Token0Contract = new Contract(token0, UniswapV2ERC20ABI, activeProvider)
    const Token1Contract = new Contract(token1, UniswapV2ERC20ABI, activeProvider)
    const [
      token0Name, token0Symbol, token0Balance, token0Price,
      token1Name, token1Symbol, token1Balance, token1Price,
    ] = await Promise.all([
      Token0Contract.name(),
      Token0Contract.symbol(),
      Token0Contract.balanceOf(poolDetails.lpToken),
      getTokenPriceUSD(token0),

      Token1Contract.name(),
      Token1Contract.symbol(),
      Token1Contract.balanceOf(poolDetails.lpToken),
      getTokenPriceUSD(token1),
    ])

    return {
      ...pool,
      poolDetails,
      poolName,
      symbol,
      totalSupply,
      token0: {
        address: token0,
        name: token0Name,
        symbol: token0Symbol,
        balance: pool.poolInfo.amount.mul(token0Balance).div(totalSupply),
        price: token0Price,
        value: Number(utils.formatEther(pool.poolInfo.amount.mul(token0Balance).div(totalSupply))) * token0Price,
      },
      token1: {
        address: token1,
        name: token1Name,
        symbol: token1Symbol,
        balance: pool.poolInfo.amount.mul(token1Balance).div(totalSupply),
        price: token1Price,
        value: Number(utils.formatEther(pool.poolInfo.amount.mul(token1Balance).div(totalSupply))) * token1Price,
      },
    }
  }))
  return activePoolsWithDetails
}
