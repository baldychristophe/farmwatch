import React, { useRef, Dispatch, SetStateAction } from 'react'

export const Landing = (props: { setUserWalletAddress: Dispatch<SetStateAction<string>> }) => {
  const inputRef = useRef(null as any)

  return (
    <div className="flex justify-center">
      <div className="absolute top-1/3 border border-white rounded-xl py-10 px-20 w-6/12">
        <div className="flex flex-col justify-center">
          <div className="mb-10">
            <h1 className="text-7xl font-light text-center tracking-wider farmwatch-gradient">Farmwatch</h1>
          </div>
          <div className="columns-1 mx-auto w-full flex">
            <input
              ref={ inputRef }
              type="text"
              className="outline-none w-full px-3"
              placeholder="Please enter your BEP20 wallet address"
            />
            <button
              className="text-white p-1 border border-white ml-5"
              onClick={ () => {
                if (inputRef && inputRef.current) {
                  props.setUserWalletAddress(inputRef.current.value)
                }
              }}
            >
              enter
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
