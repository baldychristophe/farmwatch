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

          <div className="columns-1 mx-auto text-center">
            <div className="inline-block p-3">
              <a href="https://app.mistswap.fi/swap" target="_blank" rel="noreferrer">
                <img
                  id="mistswap-logo-landing"
                  className="w-12 h-12 rounded-xl"
                  src="https://assets.mistswap.fi/blockchains/smartbch/assets/0x5fA664f69c2A4A3ec94FaC3cBf7049BD9CA73129/logo.png"
                  alt="MISTswap logo"
                />
              </a>
              <UncontrolledTooltip target="mistswap-logo-landing">
                <div className="p-1 flex justify-center">
                  <span className="text-sm mr-1">MISTswap</span>
                  <span className="material-icons text-sm">launch</span>
                </div>
              </UncontrolledTooltip>
            </div>

            <div className="inline-block p-3">
              <a href="https://tangoswap.cash/smart-swap" target="_blank" rel="noreferrer">
                <img
                  id="tangoswap-logo-landing"
                  className="w-12 h-12 rounded-xl"
                  src="https://raw.githubusercontent.com/tangoswap-cash/assets/master/blockchains/smartbch/assets/0x73BE9c8Edf5e951c9a0762EA2b1DE8c8F38B5e91/logo.png"
                  alt="TANGOswap logo"
                />
              </a>
              <UncontrolledTooltip target="tangoswap-logo-landing">
                <div className="p-1 flex justify-center">
                  <span className="text-sm mr-1">TANGOswap</span>
                  <span className="material-icons text-sm">launch</span>
                </div>
              </UncontrolledTooltip>
            </div>

            <div className="inline-block p-3 brightness-50 contrast-50">
              {/* <a href="https://dex.benswap.cash/#/swap" target="_blank" rel="noreferrer"> */}
                <img
                  id="benswap-logo-landing"
                  className="w-12 h-12 rounded-xl"
                  src="https://asset.benswap.cash/tokens/0x77CB87b57F54667978Eb1B199b28a0db8C8E1c0B.png"
                  alt="BenSwap logo"
                />
              {/* </a> */}
              <UncontrolledTooltip target="benswap-logo-landing">
                <div className="p-1 flex justify-center">
                  <span className="text-sm mr-1">BenSwap</span>
                  <span className="text-sm font-bold">Not supported yet</span>
                </div>
              </UncontrolledTooltip>
            </div>

            <div className="inline-block p-3 brightness-50 contrast-50">
              {/* <a href="https://cowswap.cash/swap" target="_blank" rel="noreferrer"> */}
                <img
                  id="cowswap-logo-landing"
                  className="w-12 h-12 rounded-xl"
                  src="https://cowswap.cash/images/MILK.png"
                  alt="CowSwap logo"
                />
              {/* </a> */}
              <UncontrolledTooltip target="cowswap-logo-landing">
                <div className="p-1 flex justify-center">
                  <span className="text-sm mr-1">CowSwap</span>
                  <span className="text-sm font-bold">Not supported yet</span>
                </div>
              </UncontrolledTooltip>
            </div>

            <div className="inline-block p-3 brightness-50 contrast-50">
              {/* <a href="https://1bch.com/" target="_blank" rel="noreferrer"> */}
                <img
                  id="OneBchDotCom-logo-landing"
                  className="w-12 h-12 rounded-xl"
                  src="https://1bch.com/images/tokens/0x77d4b6e44a53bbda9a1d156b32bb53a2d099e53d.png"
                  alt="1bch.com logo"
                />
              {/* </a> */}
              <UncontrolledTooltip target="OneBchDotCom-logo-landing">
                <div className="p-1 flex justify-center">
                  <span className="text-sm mr-1">1BCH.com</span>
                  <span className="text-sm font-bold">Not supported yet</span>
                </div>
              </UncontrolledTooltip>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
