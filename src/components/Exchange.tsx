import React from 'react'
import { utils } from 'ethers'

import { IExchange } from '../connectors/types'

export const Exchange = (props: { exchange: IExchange }) => {
  return (
    <div className="w-full border border-sky-600 rounded p-4 mt-5" key={ props.exchange.name }>
      <div className="flex justify-start items-center mb-4 border-b border-gray-600 pb-4">
        <div className="w-12 mr-4"><img src={ props.exchange.token.logoUrl } alt={ `${props.exchange.name} logo` } /></div>
        <div className="text-white text-2xl">{ props.exchange.name }</div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        { props.exchange.pools.map((pool: any) => (
          <div key={ pool.index } className="text-white border rounded border-sky-600 p-4">
            <div className="flex items-center mb-4">
              <div className="flex mr-4">
                <img
                  className="w-12 h-12 rounded-xl mr-2"
                  src={ pool.token0.logoUrl }
                  alt={ `${pool.token0.name} logo` }
                />
                <img
                  className="w-12 h-12 rounded-xl"
                  src={ pool.token1.logoUrl }
                  alt={ `${pool.token1.name} logo` }
                />
              </div>
              <div className="grow">
                <div className="text-sm">{ pool.poolName }</div>
                <div className="text-sm">{ pool.token0.symbol } / { pool.token1.symbol }</div>
                <div className="text-sm">${ (pool.token0.value + pool.token1.value).toFixed(2) }</div>
              </div>
            </div>

            <div className="text-gray-400 text-sm">
              { Number(utils.formatEther(pool.poolUserInfo.amount)).toFixed(2) } { pool.symbol }
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
  )
}
