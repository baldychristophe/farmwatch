import { getDefaultProvider, Contract } from 'ethers'
import { BigNumber, utils } from 'ethers'

import { ChainId, MASTERCHEF_ADDRESS } from '@mistswapdex/sdk'

import { getOrRefreshTokenPrice, getTokenPrice, setTokenPrice } from './store'
import { WBCH_ADDRESS, MIST_ADDRESS } from './addresses'
import { IExchange } from './types'

const BASE_LOGO_URL = 'https://assets.mistswap.fi/blockchains/smartbch/assets'

const MasterChefV2ABI = require('../abi/MasterChefV2.json')
const UniswapV2ERC20ABI = require('../abi/UniswapV2ERC20.json')
const UniswapV2PairABI = require('../abi/UniswapV2Pair.json')

const MISTSWAP_LPTOKEN_DETAILS = require('../cache/mistswap/lptoken_details.json')

const SMARTBCH_NODE_MAINNET = 'https://smartbch.fountainhead.cash/mainnet'

export const provider = () => getDefaultProvider(SMARTBCH_NODE_MAINNET)

const getTokenPriceInBenchmarkTokenFromLiquidityPool = async (tokenAddress: string, benchmarkTokenAddress: string, liquidityPoolAddress: string): Promise<number> => {
  const activeProvider = provider()
  const benchmarkContract = new Contract(benchmarkTokenAddress, UniswapV2ERC20ABI, activeProvider)
  const tokenContract = new Contract(tokenAddress, UniswapV2ERC20ABI, activeProvider)

  const [ balanceOfBenchmark, balanceOftoken ] = await Promise.all([
    benchmarkContract.balanceOf(liquidityPoolAddress),
    tokenContract.balanceOf(liquidityPoolAddress),
  ])

  return Number(utils.formatEther(balanceOftoken)) / Number(utils.formatEther(balanceOfBenchmark))
}

export const getTokenPriceFromPools = async (tokenAddress: string): Promise<number> => {
  // Check the store first
  const tokenPrice = getTokenPrice(tokenAddress)
  if (tokenPrice) {
    return tokenPrice
  }
  // Find the pools where the token is used
  // Object entries convert dict to list [[key, value], [key, value], ...]
  const poolsWithToken: any[] = Object.entries(MISTSWAP_LPTOKEN_DETAILS).filter(([_poolAddress, pool]: [string, any]) => pool.token0 === tokenAddress || pool.token1 === tokenAddress)
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

const getPoolDetails = (poolIndex: number) => {
  const activeProvider = provider()
  const masterChefContract = new Contract(MASTERCHEF_ADDRESS[ChainId.SMARTBCH], MasterChefV2ABI, activeProvider)
  return masterChefContract.poolInfo(poolIndex)
}

const getV2PairSummary = (poolAddress: string): Promise<[string, string, string, string, number, string]> => {
  const activeProvider = provider()
  const LPTokenPoolContract = new Contract(poolAddress, UniswapV2PairABI, activeProvider)
  return Promise.all([
    // Use cache when possible
    poolAddress in MISTSWAP_LPTOKEN_DETAILS ? MISTSWAP_LPTOKEN_DETAILS[poolAddress].name : LPTokenPoolContract.name(),
    poolAddress in MISTSWAP_LPTOKEN_DETAILS ? MISTSWAP_LPTOKEN_DETAILS[poolAddress].token0 : LPTokenPoolContract.token0(),
    poolAddress in MISTSWAP_LPTOKEN_DETAILS ? MISTSWAP_LPTOKEN_DETAILS[poolAddress].token1 : LPTokenPoolContract.token1(),
    poolAddress in MISTSWAP_LPTOKEN_DETAILS ? MISTSWAP_LPTOKEN_DETAILS[poolAddress].symbol : LPTokenPoolContract.symbol(),
    poolAddress in MISTSWAP_LPTOKEN_DETAILS ? MISTSWAP_LPTOKEN_DETAILS[poolAddress].decimals : LPTokenPoolContract.decimals(),
    LPTokenPoolContract.totalSupply(),
  ])
}

export const getMistSwapSummary = async (userAddress: string): Promise<IExchange> => {
  const activeProvider = provider()
  const activePools = await getActivePools(userAddress)
  // Launch and forget, do it early to hope it will be cached in the store when required later
  const MistPricePromise = getOrRefreshTokenPrice(MIST_ADDRESS)

  const activePoolsWithDetails = await Promise.all(activePools.map(async (pool) => {
    let poolDetails = await getPoolDetails(pool.index)
    let [poolName, token0, token1, symbol, decimals,totalSupply] = await getV2PairSummary(poolDetails.lpToken)

    const Token0Contract = new Contract(token0, UniswapV2ERC20ABI, activeProvider)
    const Token1Contract = new Contract(token1, UniswapV2ERC20ABI, activeProvider)
    const [
      token0Name, token0Symbol, token0Balance, token0Price,
      token1Name, token1Symbol, token1Balance, token1Price,
    ] = await Promise.all([
      Token0Contract.name(),
      Token0Contract.symbol(),
      Token0Contract.balanceOf(poolDetails.lpToken),
      getTokenPriceFromPools(token0),

      Token1Contract.name(),
      Token1Contract.symbol(),
      Token1Contract.balanceOf(poolDetails.lpToken),
      getTokenPriceFromPools(token1),
    ])

    return {
      poolUserInfo: pool.poolUserInfo,
      poolIndex: pool.index,
      poolDetails,
      poolName,
      symbol,
      totalSupply,
      decimals,
      token0: {
        address: token0,
        name: token0Name,
        symbol: token0Symbol,
        balance: pool.poolUserInfo.amount.mul(token0Balance).div(totalSupply),
        price: token0Price,
        value: Number(utils.formatEther(pool.poolUserInfo.amount.mul(token0Balance).div(totalSupply))) * token0Price,
        logoUrl: `${BASE_LOGO_URL}/${token0}/logo.png`,
      },
      token1: {
        address: token1,
        name: token1Name,
        symbol: token1Symbol,
        balance: pool.poolUserInfo.amount.mul(token1Balance).div(totalSupply),
        price: token1Price,
        value: Number(utils.formatEther(pool.poolUserInfo.amount.mul(token1Balance).div(totalSupply))) * token1Price,
        logoUrl: `${BASE_LOGO_URL}/${token1}/logo.png`,
      },
    }
  }))
  return {
    name: 'Mistswap',
    pools: activePoolsWithDetails,
    token: {
      name: 'MistToken',
      price: await MistPricePromise, // retrieve the launch and forget
      logoUrl: `${BASE_LOGO_URL}/${MIST_ADDRESS}/logo.png`,
    }
  }
}
