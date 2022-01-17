// import { configureStore, createAction, createReducer, PayloadAction } from "@reduxjs/toolkit"
// import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'

type TokenPriceRecord = Record<string, any>

// const GET_OR_REFRESH = 'GET_OR_REFRESH'

// const getOrRefreshTokenPrice = createAction<string>(GET_OR_REFRESH)

// const tokenPriceReducer = createReducer({} as TokenPriceRecord, (builder) =>
//   builder
//     .addCase(getOrRefreshTokenPrice, (state, action: PayloadAction<string>) => {
//       if (state)
//     })
// )

// export const store = configureStore({
//   reducer: { tokenPrice: tokenPriceReducer }
// })

// // Inferred types from the store itself
// export type RootState = ReturnType<typeof store.getState>
// export type AppDispatch = typeof store.dispatch

// // Define typed hooks
// // see https://redux-toolkit.js.org/tutorials/typescript#define-typed-hooks
// export const useAppDispatch = () => useDispatch<AppDispatch>()
// export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector


export const TokenPriceStore = {} as TokenPriceRecord
