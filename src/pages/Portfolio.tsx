import React, { useState, useEffect, useRef, Dispatch, SetStateAction } from 'react'
import { utils } from 'ethers'

import { getPortfolioSummary, IPortfolioSummary } from '../connectors'

export const Portfolio = (props: {
  userWalletAddress: string,
  setUserWalletAddress: Dispatch<SetStateAction<string>>
}) => {
  const [portfolioSummary, setPortfolioSummary] = useState(null as null | IPortfolioSummary)

  const inputRef = useRef(null as any)

  useEffect(() => {
    getPortfolioSummary(props.userWalletAddress).then((response) => setPortfolioSummary(response))

  }, [props.userWalletAddress])

  return (
    <>
      <div className="py-2 flex">
        <div>
          <h1 className="text-3xl font-light tracking-wider farmwatch-gradient">Farmwatch</h1>
        </div>
        <div className="ml-5">
          <form className="columns-1 mx-auto w-full flex">
            <input
              ref={ inputRef }
              type="text"
              className="outline-none w-full px-3 rounded w-[26rem]"
              placeholder="Please enter your BEP20 wallet address"
              value={ props.userWalletAddress }
              readOnly={ true }
            />
            <button
              className="text-white p-1 border border-white ml-3 material-icons rounded"
              onClick={ () => {
                if (inputRef && inputRef.current) {
                  props.setUserWalletAddress(inputRef.current.value)
                }
              }}
            >
              search
            </button>
          </form>
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

      { portfolioSummary &&
        <div className="w-full border border-sky-600 rounded p-4 mt-5">
          <div className="text-white text-2xl mb-4">
            Mistswap
          </div>
          <div className="flex flex-row gap-4">
            { portfolioSummary.dexList.map((pool: any) => (
              <div key={ pool.index } className="basis-4/12 text-white border border-sky-600 p-4">
                <div className="text-lg">{ pool.poolName }</div>
                <div className="text-base">{ pool.token0.symbol } / { pool.token1.symbol }</div>
                {/* <div>${ poolNetWorth(pool) }</div> */}
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
      }
    </>
  )
}
