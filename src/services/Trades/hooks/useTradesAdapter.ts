import { ChainId, Currency, WETH, WMATIC, WXDAI } from '@swapr/sdk'

import { useActiveWeb3React } from 'hooks'
import { useToken } from 'hooks/Tokens'
import { useEffect, useState } from 'react'
import { useSwapState } from 'state/swap/hooks'

import store from '../../../state'
import { SwaprAdapter } from '../adapters/swapr.adapter'
import { Adapters, TradesAdapter } from '../adapters/trades.adapter'

const WrappedNativeCurrencyAddress = {
  [ChainId.MAINNET]: WETH[ChainId.MAINNET].address,
  [ChainId.ARBITRUM_ONE]: WETH[ChainId.ARBITRUM_ONE].address,
  [ChainId.XDAI]: WXDAI[ChainId.XDAI].address,
  [ChainId.POLYGON]: WMATIC[ChainId.POLYGON].address,
  [ChainId.RINKEBY]: WETH[ChainId.RINKEBY].address,
  [ChainId.ARBITRUM_RINKEBY]: WETH[ChainId.ARBITRUM_RINKEBY].address,
}

const adapters: Adapters = {
  swapr: new SwaprAdapter(),
}

const getTokenAddress = (chainId: ChainId, tokenAddress: string | undefined) =>
  tokenAddress === Currency.getNative(chainId).symbol ? WrappedNativeCurrencyAddress[chainId] : tokenAddress

//TODO: handle loading
export const useTradesAdapter = () => {
  const { chainId } = useActiveWeb3React()
  const [tradesAdapter, setTradesAdapter] = useState<TradesAdapter>()
  const [symbol, setSymbol] = useState<string>()

  const {
    INPUT: { currencyId: inputCurrencyId },
    OUTPUT: { currencyId: outputCurrencyId },
  } = useSwapState()

  const [inputToken, outputToken] = [
    useToken(getTokenAddress(chainId as ChainId, inputCurrencyId)),
    useToken(getTokenAddress(chainId as ChainId, outputCurrencyId)),
  ]

  useEffect(() => {
    if (!tradesAdapter && chainId) {
      const tradesHistoryAdapter = new TradesAdapter({ adapters, chainId, store })
      setTradesAdapter(tradesHistoryAdapter)
    }

    if (tradesAdapter) {
      if (tradesAdapter.isInitialized && chainId) {
        tradesAdapter.updateActiveChainId(chainId)
      } else {
        tradesAdapter.init()
      }
    }
  }, [chainId, tradesAdapter])

  useEffect(() => {
    if (tradesAdapter && inputToken && outputToken) {
      setSymbol(`${inputToken.symbol}${outputToken.symbol}`)
      tradesAdapter.fetchTradesHistory(inputToken, outputToken)
    }
  }, [inputToken, outputToken, tradesAdapter])

  return {
    symbol,
    showTrades: inputToken && outputToken ? true : false,
  }
}