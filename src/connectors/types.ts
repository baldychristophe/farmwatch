import { BigNumber } from "ethers";

export type IPoolInfo = [
  lpToken: string,
  allocPoint: BigNumber,
  lastRewardBloc: BigNumber,
  accSushiPerShare: BigNumber,
]

export interface IPoolUserInfo {
  amount: BigNumber,
  rewardDebt: BigNumber,
}

export interface ITokenCompleteDetails {
  address: string,
  name: string,
  symbol: string,
  decimals: number,
  balance: BigNumber,
  price: number,
  value: number,
  logoUrl: string,
}

export interface IPool {
  poolIndex: number,
  poolName: string,
  symbol: string,
  decimals: number,
  totalSupply: BigNumber,
  roiPerYear: number,
  poolUserInfo: IPoolUserInfo,
  poolDetails: IPoolInfo,
  token0: ITokenCompleteDetails,
  token1: ITokenCompleteDetails,
}

export interface IExchange {
  name: string,
  pools: Array<IPool>,
  token: {
    name: string,
    price: number,
    logoUrl: string,
  }
}

export interface IPortfolioSummary {
  netWorth: number,
  balance: number,
  BCHPrice: number,
  exchanges: Array<IExchange>,
}
