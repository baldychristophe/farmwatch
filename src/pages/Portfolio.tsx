import React, { useState, useEffect } from 'react'
import { BigNumber, utils } from 'ethers'

import { getBalance } from '../connectors'

export const Portfolio = (props: { userWalletAddress: string }) => {
  const [balance, setBalance] = useState('')

  const fetchBalance = () => {
    getBalance(props.userWalletAddress).then((response: BigNumber) => setBalance(utils.formatEther(response)))
  }

  useEffect(() => {
    fetchBalance()
  })

  return (
    <div className="text-white">
      <div>Wallet Address: { props.userWalletAddress }</div>
      <div>Balance: { balance }</div>
    </div>
  )
}
