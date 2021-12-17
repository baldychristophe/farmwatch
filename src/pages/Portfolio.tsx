import React, { useState, useEffect, useRef, Dispatch, SetStateAction } from 'react'
import { BigNumber, utils } from 'ethers'

import { getBalance, getBCHPriceUSD } from '../connectors'

export const Portfolio = (props: {
  userWalletAddress: string,
  setUserWalletAddress: Dispatch<SetStateAction<string>>
}) => {
  const [balance, setBalance] = useState('')
  const [BCHPrice, setBCHPrice] = useState('')

  const inputRef = useRef(null as any)

  const fetchBalance = () => {
    getBalance(props.userWalletAddress).then((response: BigNumber) => setBalance(utils.formatEther(response)))
  }

  useEffect(() => {
    fetchBalance()
    getBCHPriceUSD().then((BCHprice: BigNumber) => setBCHPrice(BCHprice.toNumber().toFixed(2)))
  })

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
        <div className="text-white text-center basis-3/12 flex-col">
          <div className="text-xl farmwatch-gradient">Net Worth</div>
          <div className="text-3xl">{ Number(Number(balance) * Number(BCHPrice)).toFixed(2) } $</div>
        </div>

        <div className="text-white text-center basis-3/12 flex-col justify-center">
          <div className="text-xl farmwatch-gradient">Wallet Balance</div>
          <div className="text-3xl">{ Number(balance).toFixed(4) } BCH</div>
        </div>
      </div>
    </>
  )
}
