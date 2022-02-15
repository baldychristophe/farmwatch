import { Contract } from 'ethers'
import { BigNumber, utils } from 'ethers'

import { ChainId, MASTERCHEF_ADDRESS } from '@tangoswapcash/sdk'

import { getOrRefreshTokenPrice, getTokenPrice, setTokenPrice } from './store'
import {
  WBCH_ADDRESS, TANGO_ADDRESS,
  provider, BLOCKS_PER_DAY,
  UniswapV2ERC20ABI, MasterChefV2ABI, UniswapV2PairABI,
  MISTSWAP_TOKEN_DETAILS, MISTSWAP_POOL_DETAILS
} from './constants'
import { IExchange, IPoolInfo } from './types'
import { getTokenPriceInBenchmarkTokenFromLiquidityPool } from './prices'

const BASE_LOGO_URL = 'https://raw.githubusercontent.com/tangoswap-cash/assets/master/blockchains/smartbch/assets'

export const getTokenPriceFromPools = async (tokenAddress: string): Promise<number> => {
  // Check the store first
  const tokenPrice = getTokenPrice(tokenAddress)
  if (tokenPrice) {
    return tokenPrice
  }
  // Find the pools where the token is used
  // Object entries convert dict to list [[key, value], [key, value], ...]
  const poolsWithToken: any[] = Object.entries(MISTSWAP_POOL_DETAILS).filter(([_poolAddress, pool]: [string, any]) => pool.token0 === tokenAddress || pool.token1 === tokenAddress)
  // Find if there is a pool with WBCH
  const poolWithWBCH: any[] = poolsWithToken.filter(([_poolAddress, pool]: [string, any]) => pool.token0 === WBCH_ADDRESS || pool.token1 === WBCH_ADDRESS)
  if (poolWithWBCH.length > 0) {
    const tokenPriceInBCH = await getTokenPriceInBenchmarkTokenFromLiquidityPool(tokenAddress, WBCH_ADDRESS, poolWithWBCH[0][0])
    const WBCHPriceInUSD = await getOrRefreshTokenPrice(WBCH_ADDRESS)
    const tokenPriceInUSD = WBCHPriceInUSD / tokenPriceInBCH
    setTokenPrice(tokenAddress, tokenPriceInUSD)
    return tokenPriceInUSD
  }
  // Else recursively get the price of any token it shares a pool with
  // Hope that this part does not get stuck in an infinite loop
  const randomBenchmarkTokenAddress = poolsWithToken[0][1].token0 !== tokenAddress ? poolsWithToken[0][1].token0 : poolsWithToken[0][1].token1
  const tokenPriceInRandomBenchmarkToken = await getTokenPriceInBenchmarkTokenFromLiquidityPool(tokenAddress, randomBenchmarkTokenAddress, poolsWithToken[0][0])
  // Get the price in USD of the benchmark
  const benchmarkPriceInUSD = await getTokenPriceFromPools(randomBenchmarkTokenAddress)
  const tokenPriceInUSD = benchmarkPriceInUSD / tokenPriceInRandomBenchmarkToken
  setTokenPrice(tokenAddress, tokenPriceInUSD)
  return tokenPriceInUSD
}

const getTotalAllocPoint = async (): Promise<BigNumber> => {
  const activeProvider = provider()
  const masterChefContract = new Contract(MASTERCHEF_ADDRESS[ChainId.SMARTBCH], MasterChefV2ABI, activeProvider)
  return masterChefContract.totalAllocPoint()
}

const getSushiPerBlock = async (): Promise<BigNumber> => {
  const activeProvider = provider()
  const masterChefContract = new Contract(MASTERCHEF_ADDRESS[ChainId.SMARTBCH], MasterChefV2ABI, activeProvider)
  return masterChefContract.sushiPerBlock()
}

const getActivePools = async (userAddress: string): Promise<Array<{ poolUserInfo: { amount: BigNumber, rewardDebt: BigNumber }, index: number }>> => {
  const activeProvider = provider()
  const masterChefContract = new Contract(MASTERCHEF_ADDRESS[ChainId.SMARTBCH], MasterChefV2ABI, activeProvider)
  const poolLength = await masterChefContract.poolLength()

  const poolInfos = await Promise.all(
    Array.from({ length: poolLength }, (_, poolIndex) => masterChefContract.userInfo(poolIndex, userAddress))
  )
  return poolInfos
  .map((poolUserInfo, index) => ({ index, poolUserInfo })) // Add the index
  .filter(
    (pool: { poolUserInfo: { amount: BigNumber, rewardDebt: BigNumber }, index: number }) => !pool.poolUserInfo.amount.isZero()
  )
}

const getPoolDetails = (poolIndex: number): Promise<IPoolInfo> => { // type
  const activeProvider = provider()
  const masterChefContract = new Contract(MASTERCHEF_ADDRESS[ChainId.SMARTBCH], MasterChefV2ABI, activeProvider)
  return masterChefContract.poolInfo(poolIndex)
}

const getV2PairSummary = (poolAddress: string): Promise<[string, string, string, string, number, BigNumber]> => {
  const activeProvider = provider()
  const LPTokenPoolContract = new Contract(poolAddress, UniswapV2PairABI, activeProvider)
  return Promise.all([
    // Use cache when possible
    poolAddress in MISTSWAP_POOL_DETAILS ? MISTSWAP_POOL_DETAILS[poolAddress].name : LPTokenPoolContract.name(),
    poolAddress in MISTSWAP_POOL_DETAILS ? MISTSWAP_POOL_DETAILS[poolAddress].token0 : LPTokenPoolContract.token0(),
    poolAddress in MISTSWAP_POOL_DETAILS ? MISTSWAP_POOL_DETAILS[poolAddress].token1 : LPTokenPoolContract.token1(),
    poolAddress in MISTSWAP_POOL_DETAILS ? MISTSWAP_POOL_DETAILS[poolAddress].symbol : LPTokenPoolContract.symbol(),
    poolAddress in MISTSWAP_POOL_DETAILS ? MISTSWAP_POOL_DETAILS[poolAddress].decimals : LPTokenPoolContract.decimals(),
    LPTokenPoolContract.totalSupply(),
  ])
}

export const getTangoSwapSummary = async (userAddress: string): Promise<IExchange> => {
  const activeProvider = provider()

  const [activePools, TangoPrice, totalAllocPoint, sushiPerBlock] = await Promise.all([
    getActivePools(userAddress),
    getOrRefreshTokenPrice(TANGO_ADDRESS),
    getTotalAllocPoint(),
    getSushiPerBlock(),
  ])

  const activePoolsWithDetails = await Promise.all(activePools.map(async (pool) => {
    let poolDetails = await getPoolDetails(pool.index)
    let [poolName, token0, token1, symbol, decimals, totalSupply] = await getV2PairSummary(poolDetails[0])

    const Token0Contract = new Contract(token0, UniswapV2ERC20ABI, activeProvider)
    const Token1Contract = new Contract(token1, UniswapV2ERC20ABI, activeProvider)
    const [
      token0Name, token0Symbol, token0Decimals, token0Balance, token0Price,
      token1Name, token1Symbol, token1Decimals, token1Balance, token1Price,
    ] = await Promise.all([
      token0 in MISTSWAP_TOKEN_DETAILS ? MISTSWAP_TOKEN_DETAILS[token0].name : Token0Contract.name(),
      token0 in MISTSWAP_TOKEN_DETAILS ? MISTSWAP_TOKEN_DETAILS[token0].symbol : Token0Contract.symbol(),
      token0 in MISTSWAP_TOKEN_DETAILS ? MISTSWAP_TOKEN_DETAILS[token0].decimals : Token0Contract.decimals(),
      Token0Contract.balanceOf(poolDetails[0]),
      getTokenPriceFromPools(token0),

      token1 in MISTSWAP_TOKEN_DETAILS ? MISTSWAP_TOKEN_DETAILS[token1].name : Token1Contract.name(),
      token1 in MISTSWAP_TOKEN_DETAILS ? MISTSWAP_TOKEN_DETAILS[token1].symbol : Token1Contract.symbol(),
      token1 in MISTSWAP_TOKEN_DETAILS ? MISTSWAP_TOKEN_DETAILS[token1].decimals : Token1Contract.decimals(),
      Token1Contract.balanceOf(poolDetails[0]),
      getTokenPriceFromPools(token1),
    ])

    const rewardPerBlock = poolDetails[1].toNumber() / totalAllocPoint.toNumber() * Number(utils.formatUnits(sushiPerBlock, 18))
    const TVL = Number(utils.formatUnits(token0Balance, token0Decimals)) * token0Price + Number(utils.formatUnits(token1Balance, token1Decimals)) * token1Price
    const roiPerBlock = rewardPerBlock * TangoPrice / TVL
    const roiPerYear = roiPerBlock * BLOCKS_PER_DAY * 365

    return {
      poolUserInfo: pool.poolUserInfo,
      poolIndex: pool.index,
      poolDetails,
      poolName,
      symbol,
      totalSupply,
      decimals,
      roiPerYear,
      token0: {
        address: token0,
        name: token0Name,
        symbol: token0Symbol,
        decimals: token0Decimals,
        balance: pool.poolUserInfo.amount.mul(token0Balance).div(totalSupply),
        price: token0Price,
        value: Number(utils.formatUnits(pool.poolUserInfo.amount.mul(token0Balance).div(totalSupply), token0Decimals)) * token0Price,
        logoUrl: `${BASE_LOGO_URL}/${token0}/logo.png`,

      },
      token1: {
        address: token1,
        name: token1Name,
        symbol: token1Symbol,
        decimals: token1Decimals,
        balance: pool.poolUserInfo.amount.mul(token1Balance).div(totalSupply),
        price: token1Price,
        value: Number(utils.formatUnits(pool.poolUserInfo.amount.mul(token1Balance).div(totalSupply), token1Decimals)) * token1Price,
        logoUrl: `${BASE_LOGO_URL}/${token1}/logo.png`,
      },
    }
  }))
  return {
    name: 'TANGOswap',
    pools: activePoolsWithDetails,
    token: {
      name: 'TangoToken',
      price: TangoPrice,
      logoUrl: `${BASE_LOGO_URL}/${TANGO_ADDRESS}/logo.png`,
    }
  }
}
