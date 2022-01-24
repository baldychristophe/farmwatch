export interface IExchange {
  name: string,
  pools: Array<any>,
  logoUrl: string,
  token: {
    name: string,
    price: number,
  }
}

export interface IPortfolioSummary {
  netWorth: number,
  balance: number,
  BCHPrice: number,
  exchanges: Array<IExchange>,
}
