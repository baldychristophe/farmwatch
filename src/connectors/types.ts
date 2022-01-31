import { BigNumber } from "ethers";

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
  poolUserInfo: {
    amount: BigNumber,
    rewardDebt: BigNumber,
  },
  poolDetails: {
    lpToken: string,
    allocPoint: BigNumber,
    lastRewardBloc: BigNumber,
    accSushiPerShare: BigNumber,
  },
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
