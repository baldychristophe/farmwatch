import { getDefaultProvider, Contract } from 'ethers'
import { BigNumber, utils } from 'ethers'

import { ChainId, MASTERCHEF_ADDRESS } from '@mistswapdex/sdk'

import { getOrRefreshTokenPrice } from './store'

const MasterChefV2ABI = require('../abi/MasterChefV2.json')
const UniswapV2ERC20ABI = require('../abi/UniswapV2ERC20.json')
const UniswapV2PairABI = require('../abi/UniswapV2Pair.json')

const MISTSWAP_LPTOKEN_DETAILS = require('../cache/mistswap/lptoken_details.json')

const SMARTBCH_NODE_MAINNET = 'https://smartbch.fountainhead.cash/mainnet'

export const provider = () => getDefaultProvider(SMARTBCH_NODE_MAINNET)

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

export const getV2PairSummary = (poolAddress: string): Promise<[string, string, string, string, string]> => {
  const activeProvider = provider()
  const LPTokenPoolContract = new Contract(poolAddress, UniswapV2PairABI, activeProvider)
  console.log('token details', MISTSWAP_LPTOKEN_DETAILS[poolAddress])
  return Promise.all([
    // Use cache when possible
    poolAddress in MISTSWAP_LPTOKEN_DETAILS ? MISTSWAP_LPTOKEN_DETAILS[poolAddress].name : LPTokenPoolContract.name(),
    poolAddress in MISTSWAP_LPTOKEN_DETAILS ? MISTSWAP_LPTOKEN_DETAILS[poolAddress].token0 : LPTokenPoolContract.token0(),
    poolAddress in MISTSWAP_LPTOKEN_DETAILS ? MISTSWAP_LPTOKEN_DETAILS[poolAddress].token1 : LPTokenPoolContract.token1(),
    poolAddress in MISTSWAP_LPTOKEN_DETAILS ? MISTSWAP_LPTOKEN_DETAILS[poolAddress].symbol : LPTokenPoolContract.symbol(),
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
      getOrRefreshTokenPrice(token0),

      Token1Contract.name(),
      Token1Contract.symbol(),
      Token1Contract.balanceOf(poolDetails.lpToken),
      getOrRefreshTokenPrice(token1),
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
