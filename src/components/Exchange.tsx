import React from 'react'
import { utils } from 'ethers'

import { UncontrolledTooltip } from './UncontrolledTooltip'
import { IExchange, IPool } from '../connectors/types'
import { displayCurrency, displayNumber, displayPercentage } from '../numberUtils'

export const Exchange = (props: { exchange: IExchange }) => {
  return (
    <div className="w-full border border-sky-600 rounded p-4 mt-5" key={ props.exchange.name }>
      <div className="flex justify-start items-center mb-4 border-b border-gray-600 pb-4">
        <img
          className="w-12 mr-4"
          id={ `${props.exchange.name}-logo` }
          src={ props.exchange.token.logoUrl }
          alt={ `${props.exchange.name} logo` }
          aria-describedby="tooltip"
        />
        <UncontrolledTooltip target={ `${props.exchange.name}-logo` }>
          <div className="p-1 text-sm">
            { props.exchange.token.name } : { displayCurrency(props.exchange.token.price) }
          </div>
        </UncontrolledTooltip>
        <div className="text-white text-2xl">{ props.exchange.name }</div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        { props.exchange.pools.map((pool: IPool) => (
          <div key={ pool.poolIndex } className="text-white border rounded border-sky-600 p-4">
            <div className="flex items-center mb-4">
              <div className="flex mr-4">
                <img
                  id={ `${props.exchange.name}-pool-${pool.poolIndex}-${pool.token0.symbol}` }
                  className="w-12 h-12 rounded-xl mr-2"
                  src={ pool.token0.logoUrl }
                  alt={ `${pool.token0.name} logo` }
                />
                <UncontrolledTooltip target={ `${props.exchange.name}-pool-${pool.poolIndex}-${pool.token0.symbol}` }>
                  <div className="p-1 text-sm">
                    { pool.token0.name } : { displayCurrency(pool.token0.price) }
                  </div>
                </UncontrolledTooltip>
                <img
                  id={ `${props.exchange.name}-pool-${pool.poolIndex}-${pool.token1.symbol}` }
                  className="w-12 h-12 rounded-xl"
                  src={ pool.token1.logoUrl }
                  alt={ `${pool.token1.name} logo` }
                />
                <UncontrolledTooltip target={ `${props.exchange.name}-pool-${pool.poolIndex}-${pool.token1.symbol}` }>
                  <div className="p-1 text-sm">
                  { pool.token1.name } : { displayCurrency(pool.token1.price) }
                  </div>
                </UncontrolledTooltip>
              </div>
              <div className="grow">
                <div className="text-sm">{ pool.poolName }</div>
                <div className="text-sm">{ pool.token0.symbol } / { pool.token1.symbol }</div>
                <div className="text-sm">{ displayCurrency(pool.token0.value + pool.token1.value) }</div>
              </div>

              <div className="self-start">
                { displayPercentage(pool.roiPerYear) }
              </div>
            </div>

            <div className="text-gray-400 text-sm">
              { displayNumber(Number(utils.formatUnits(pool.poolUserInfo.amount, pool.decimals))) } { pool.symbol }
            </div>
            <div className="text-gray-400 text-sm">
              <span>{ displayNumber(Number(utils.formatUnits(pool.token0.balance, pool.token0.decimals))) } { pool.token0.symbol }</span>
              <span> / </span>
              <span>{ displayNumber(Number(utils.formatUnits(pool.token1.balance, pool.token1.decimals))) } { pool.token1.symbol }</span>
            </div>
          </div>
        )) }
      </div>
    </div>
  )
}
