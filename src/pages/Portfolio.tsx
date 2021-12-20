import React, { useState, useEffect, useRef, Dispatch, SetStateAction } from 'react'
import { BigNumber, utils } from 'ethers'

import { getBalance, getTokenPriceUSD, getMistSwapSummary } from '../connectors'

export const Portfolio = (props: {
  userWalletAddress: string,
  setUserWalletAddress: Dispatch<SetStateAction<string>>
}) => {
  const [balance, setBalance] = useState('')
  const [BCHPrice, setBCHPrice] = useState('')
  const [MISTPrice, setMISTPrice] = useState('')
  const [activePools, setActivePools] = useState(null as any)

  const inputRef = useRef(null as any)

  const getPrice = (tokenAddress: string) => {
    if (tokenAddress === '0x3743eC0673453E5009310C727Ba4eaF7b3a1cc04') {
      return BCHPrice
    } else if (tokenAddress === '0x5fA664f69c2A4A3ec94FaC3cBf7049BD9CA73129') {
      return MISTPrice
    }
    return 1
  }

  const poolNetWorth = (pool: any) => {
    return Number(
      (Number(utils.formatEther(pool.token0.balance)) * Number(getPrice(pool.token0.address)))
      +
      (Number(utils.formatEther(pool.token1.balance)) * Number(getPrice(pool.token1.address)))
    ).toFixed(2)
  }

  const totalPoolsNetWorth = (pools: any): number => {
    return pools.reduce((acc: number, val: any) => acc + Number(poolNetWorth(val)), 0)
  }

  useEffect(() => {
    getBalance(props.userWalletAddress).then((response: BigNumber) => setBalance(utils.formatEther(response)))
    // WBCH
    getTokenPriceUSD('0x3743eC0673453E5009310C727Ba4eaF7b3a1cc04').then(
      (BCHprice: BigNumber) => setBCHPrice(BCHprice.toNumber().toFixed(2))
    )
    // MIST
    getTokenPriceUSD('0x5fA664f69c2A4A3ec94FaC3cBf7049BD9CA73129').then(
      (MISTPrice: string) => setMISTPrice(MISTPrice)
    )

    getMistSwapSummary(props.userWalletAddress).then((activePools) => setActivePools(activePools))

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
          { BCHPrice && activePools &&
            <div className="text-3xl">
              ${ Number(
                  (Number(balance) * Number(BCHPrice))
                  +
                  totalPoolsNetWorth(activePools)
                ).toFixed(2)
              }
            </div>
          }
        </div>

        <div className="text-white text-center basis-6/12 flex-col justify-center">
          <div className="text-xl farmwatch-gradient">Wallet Balance</div>
          <div className="text-3xl">${ Number(Number(balance) * Number(BCHPrice)).toFixed(2) }</div>
        </div>
      </div>

      { activePools &&
        <div className="w-full border border-sky-600 rounded p-4 mt-5">
          <div className="text-white text-2xl mb-4">
            Mistswap
          </div>
          <div className="flex flex-row gap-4">
            { activePools.map((pool: any) => (
              <div key={ pool.index } className="basis-4/12 text-white border border-sky-600 p-4">
                <div className="text-lg">{ pool.poolName }</div>
                <div className="text-lg">{ pool.token0.name }/{ pool.token1.name }</div>
                <div>${ poolNetWorth(pool) }</div>
                <div className="text-gray-400 text-sm">
                  { Number(utils.formatEther(pool.poolInfo.amount)).toFixed(2) } { pool.symbol }
                </div>
                <div>
                  <span>{ Number(utils.formatEther(pool.token0.balance)).toFixed(3) } { pool.token0.symbol }</span>
                  <span>/</span>
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
