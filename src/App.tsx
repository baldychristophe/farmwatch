import React, { useState } from 'react'

import { Landing } from './pages/Landing'

import './App.scss'

export const App = () => {
  const [userWalletAddress, setUserWalletAddress] = useState('')

  return (
    <div className="bg-zinc-900">
      <div className="container mx-auto min-h-screen">
        { !userWalletAddress ?
          <Landing
            setUserWalletAddress={ setUserWalletAddress }
          />
          :
          <div className="text-white">
            Wallet Address { userWalletAddress }
          </div>

        }

      </div>
    </div>
  )
}
