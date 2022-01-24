interface IPool {
  
}

export interface IExchange {
  name: string,
  pools: Array<any>,
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
