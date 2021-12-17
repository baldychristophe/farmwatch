import React, { useState } from 'react'

import { Landing } from './pages/Landing'
import { Portfolio } from './pages/Portfolio'

import './App.scss'

export const App = () => {
  const [userWalletAddress, setUserWalletAddress] = useState('')

  return (
    <div className="bg-zinc-800">
      <div className="container mx-auto min-h-screen">
        { !userWalletAddress ?
          <Landing
            setUserWalletAddress={ setUserWalletAddress }
          />
          :
          <Portfolio userWalletAddress={ userWalletAddress } setUserWalletAddress={ setUserWalletAddress } />
        }

      </div>
    </div>
  )
}
