import React, { Dispatch, SetStateAction, useState } from 'react'

export const WalletAddressInput = (props: {
  userWalletAddress?: string,
  setUserWalletAddress: Dispatch<SetStateAction<string>>,
}) => {
  const [walletAddress, setWalletAddress] = useState(props.userWalletAddress || '')

  const submitForm = (e: any) => {
    e.preventDefault()
    if (walletAddress) {
      props.setUserWalletAddress(walletAddress)
    }
  }

  return (
    <form className="flex" onSubmit={ submitForm }>
      <input
        type="text"
        className="outline-none w-full px-3 rounded w-96 text-sm"
        placeholder="Please enter your BEP20 wallet address"
        value={ walletAddress }
        onChange={ (e) => setWalletAddress(e.target.value) }
      />
      <button
        className="text-white p-1 border border-white ml-3 material-icons rounded"
        onClick={ () => {
          if (walletAddress) {
            props.setUserWalletAddress(walletAddress)
          }
        }}
      >
        search
      </button>
    </form>
  )
}
