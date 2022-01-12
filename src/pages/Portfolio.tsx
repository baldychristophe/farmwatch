import React, { useState, useEffect, Dispatch, SetStateAction } from 'react'
import { utils } from 'ethers'


import { WalletAddressInput } from '../components/WalletAddressInput'
import { getPortfolioSummary } from '../connectors'
import { IPortfolioSummary } from '../connectors/types'

const BASE_LOGO_URL = 'https://assets.mistswap.fi/blockchains/smartbch/assets/'

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
          <h1 className="text-3xl font-light tracking-wider farmwatch-gradient">Farmwatch</h1>
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
              ${ portfolioSummary.netWorth.toFixed(2) }
            </div>
          }
        </div>

        <div className="text-white text-center basis-6/12 flex-col justify-center">
          <div className="text-xl farmwatch-gradient">Wallet Balance</div>
          { portfolioSummary &&
            <div className="text-3xl">${ portfolioSummary.balance.toFixed(2) }</div>
          }
        </div>
      </div>

      { portfolioSummary && portfolioSummary.dexList.map((dex: any) => (
        <div className="w-full border border-sky-600 rounded p-4 mt-5" key={ dex.name }>
          <div className="flex justify-start items-center mb-4">
            <div className="w-12 mr-4"><img src={ dex.logoUrl } alt={ `${dex.name} logo` } /></div>
            <div className="text-white text-2xl">{ dex.name }</div>
          </div>
          <div className="flex flex-row gap-4">
            { dex.pools.map((pool: any) => (
              <div key={ pool.index } className="basis-4/12 text-white border rounded border-sky-600 p-4">
                <div className="flex items-center mb-4">
                  <div className="flex mr-4">
                    <img className="w-12 h-12 rounded-xl mr-2" src={ `${BASE_LOGO_URL}${pool.token0.address}/logo.png` } alt={ `${pool.token0.name} logo` } />
                    <img className="w-12 h-12 rounded-xl" src={ `${BASE_LOGO_URL}${pool.token1.address}/logo.png` } alt={ `${pool.token1.name} logo` } />
                  </div>
                  <div className="grow">
                    <div className="text-sm">{ pool.poolName }</div>
                    <div className="text-sm">{ pool.token0.symbol } / { pool.token1.symbol }</div>
                    <div className="text-sm">${ (pool.token0.value + pool.token1.value).toFixed(2) }</div>
                  </div>
                </div>

                <div className="text-gray-400 text-sm">
                  { Number(utils.formatEther(pool.poolInfo.amount)).toFixed(2) } { pool.symbol }
                </div>
                <div className="text-gray-400 text-sm">
                  <span>{ Number(utils.formatEther(pool.token0.balance)).toFixed(3) } { pool.token0.symbol }</span>
                  <span> / </span>
                  <span>{ Number(utils.formatEther(pool.token1.balance)).toFixed(3) } { pool.token1.symbol }</span>
                </div>
              </div>
            )) }
          </div>
        </div>
      ))}
    </>
  )
}
