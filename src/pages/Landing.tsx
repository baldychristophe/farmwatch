import React, { Dispatch, SetStateAction } from 'react'

import { WalletAddressInput } from '../components/WalletAddressInput'

export const Landing = (props: { setUserWalletAddress: Dispatch<SetStateAction<string>> }) => {
  return (
    <div className="flex justify-center">
      <div className="absolute top-1/3 border border-white rounded-xl py-10 px-32">
        <div className="flex flex-col justify-center">
          <div className="mb-10">
            <h1 className="text-7xl font-light text-center tracking-wider farmwatch-gradient">Farmwatch</h1>
          </div>

          <div className="columns-1 mx-auto w-full">
            <WalletAddressInput setUserWalletAddress={ props.setUserWalletAddress } />
          </div>
        </div>
      </div>
    </div>
  )
}
