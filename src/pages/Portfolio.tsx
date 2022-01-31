import React, { useState, useEffect, Dispatch, SetStateAction } from 'react'

import { WalletAddressInput } from '../components/WalletAddressInput'
import { Exchange } from '../components/Exchange'
import { getPortfolioSummary } from '../connectors'
import { IPortfolioSummary, IExchange } from '../connectors/types'
import { displayCurrency } from '../numberUtils'

export const Portfolio = (props: {
  userWalletAddress: string,
  setUserWalletAddress: Dispatch<SetStateAction<string>>
}) => {
  const [portfolioSummary, setPortfolioSummary] = useState(null as null | IPortfolioSummary)

  useEffect(() => {
    getPortfolioSummary(props.userWalletAddress).then((response) => setPortfolioSummary(response))

  }, [props.userWalletAddress])

  return (
    <>
      <div className="py-2 flex">
        <div>
          <a href={ window.location.href }>
            <h1 className="text-3xl font-light tracking-wider farmwatch-gradient">Farmwatch</h1>
          </a>
        </div>
        <div className="ml-5 columns-1 mx-auto w-full">
          <WalletAddressInput
            userWalletAddress={ props.userWalletAddress }
            setUserWalletAddress={ props.setUserWalletAddress }
          />
        </div>
      </div>

      <div className="w-full border border-sky-600 rounded p-4 mt-5 flex">
        <div className="text-white text-center basis-6/12 flex-col">
          <div className="text-xl farmwatch-gradient">Net Worth</div>
          { portfolioSummary &&
            <div className="text-3xl">
              { displayCurrency(portfolioSummary.netWorth) }
            </div>
          }
        </div>

        <div className="text-white text-center basis-6/12 flex-col justify-center">
          <div className="text-xl farmwatch-gradient">Wallet Balance</div>
          { portfolioSummary &&
            <div className="text-3xl">{ displayCurrency(portfolioSummary.balance) }</div>
          }
        </div>
      </div>

      { portfolioSummary && portfolioSummary.exchanges.map((exchange: IExchange) => <Exchange exchange={ exchange } key={ exchange.name } />)}
    </>
  )
}
