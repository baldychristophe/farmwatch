import React, { Dispatch, SetStateAction } from 'react'

import { WalletAddressInput } from '../components/WalletAddressInput'
import { UncontrolledTooltip } from '../components/UncontrolledTooltip'

export const Landing = (props: { setUserWalletAddress: Dispatch<SetStateAction<string>> }) => {
  return (
    <div className="flex justify-center">
      <div className="absolute top-1/3 border border-white rounded-xl py-10 px-32">
        <div className="flex flex-col justify-center">
          <div className="mb-10">
            <a href={ window.location.href }>
              <h1 className="text-7xl font-light text-center tracking-wider farmwatch-gradient">Farmwatch</h1>
            </a>
          </div>

          <div className="columns-1 mx-auto w-full mb-10">
            <WalletAddressInput setUserWalletAddress={ props.setUserWalletAddress } />
          </div>

          <div className="columns-1 mx-auto mb-10 flex border border-zinc-700 rounded px-4 py-2">
            <img className="w-6 h-6 rounded" src="https://assets.mistswap.fi/blockchains/smartbch/assets/0x3743eC0673453E5009310C727Ba4eaF7b3a1cc04/logo.png" alt="WBCH logo" />
            <span className="ml-3 text-white text-sm">smartBCH</span>
          </div>

          <div className="columns-1 mx-auto">
            <a href="https://app.mistswap.fi/swap" target="_blank" rel="noreferrer">
              <img
                id="mistswap-logo-landing"
                className="w-12 h-12 rounded-xl"
                src="https://assets.mistswap.fi/blockchains/smartbch/assets/0x5fA664f69c2A4A3ec94FaC3cBf7049BD9CA73129/logo.png"
                alt="Mistswap logo"
              />
            </a>
            <UncontrolledTooltip target="mistswap-logo-landing">
              <div className="p-1 flex justify-center">
                <span className="text-sm mr-1">Mistswap</span>
                <span className="material-icons text-sm">launch</span>
              </div>
            </UncontrolledTooltip>
          </div>
        </div>
      </div>
    </div>
  )
}
