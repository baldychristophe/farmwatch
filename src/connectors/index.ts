import { getDefaultProvider, Contract } from 'ethers'
import { BigNumber, utils } from 'ethers'

const MasterChefV2ABI = require('../abi/MasterChefV2.json')
const UniswapV2ERC20ABI = require('../abi/UniswapV2ERC20.json')
const UniswapV2PairABI = require('../abi/UniswapV2Pair.json')

const SMARTBCH_NODE_MAINNET = 'https://smartbch.fountainhead.cash/mainnet'

const WBCH_ADDRESS = '0x3743eC0673453E5009310C727Ba4eaF7b3a1cc04'
const FLEXUSD_ADDRESS = '0x7b2B3C5308ab5b2a1d9a94d20D35CCDf61e05b72'
const MIST_ADDRESS = '0x5fA664f69c2A4A3ec94FaC3cBf7049BD9CA73129'

const MISTSWAP_MASTERCHEF_ADDRESS = '0x3A7B9D0ed49a90712da4E087b17eE4Ac1375a5D4'
const LPTOKEN_WBCH_FLEXUSD_ADDRESS = '0x24f011f12Ea45AfaDb1D4245bA15dCAB38B43D13'
const LPTOKEN_MIST_FLEXUSD_ADDRESS = '0x437E444365aD9ed788e8f255c908bceAd5AEA645'

export const provider = () => getDefaultProvider(SMARTBCH_NODE_MAINNET)

export const getBalance = (userAddress: string) : Promise<BigNumber> => {
  return provider().getBalance(userAddress)
}

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
  const masterChefContract = new Contract(MISTSWAP_MASTERCHEF_ADDRESS, MasterChefV2ABI, activeProvider)
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
  const masterChefContract = new Contract(MISTSWAP_MASTERCHEF_ADDRESS, MasterChefV2ABI, activeProvider)
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
  console.log(activePoolsWithDetails)
  return activePoolsWithDetails
}

const totalPoolsNetWorth = (pools: any): number => {
  let accumaltionValue = 0
  for (const pool of pools) {
    accumaltionValue += pool.token0.value + pool.token1.value
  }
  return accumaltionValue
}

export interface IPortfolioSummary {
  netWorth: number,
  balance: number,
  BCHPrice: number,
  dexList: Array<any>,
}

export const getPortfolioSummary = async (userAddress: string) : Promise<IPortfolioSummary> => {
  const [ userWalletBalance, BCHPrice, mistSwapSummary ] = await Promise.all([
    getBalance(userAddress),
    getTokenPriceUSD('0x3743eC0673453E5009310C727Ba4eaF7b3a1cc04'), // WBCH
    getMistSwapSummary(userAddress),
  ])

  const totalPools = totalPoolsNetWorth(mistSwapSummary)
  console.log('total pool worth', totalPools)

  const netWorth = Number(
    totalPools
    +
    Number(utils.formatEther(userWalletBalance)) * BCHPrice
  )

  return {
    dexList: [{ name: 'Mistswap', pools: mistSwapSummary }],
    balance: Number(utils.formatEther(userWalletBalance)) * BCHPrice, // in BCH
    BCHPrice: BCHPrice,
    netWorth: netWorth,
  }
}
