import { ChainId, Token } from '@swapr/sdk'

import { Store } from '@reduxjs/toolkit'
import { AppState } from 'state'

type AdapterKeys = 'swapr'

type TradesHistoryAdapterConstructorParams = {
  adapters: Adapters
  chainId: ChainId
  store: Store<AppState>
}

export type Adapters = { [key in AdapterKeys]: AbstractTradesAdapter }

export type AdapterInitialArguments = Omit<TradesHistoryAdapterConstructorParams, 'adapters'>

// each adapter should extend this class
export abstract class AbstractTradesAdapter {
  protected _chainId: ChainId | undefined
  protected _store: Store<AppState> | undefined

  abstract updateActiveChainId(chainId: ChainId): void

  abstract setInitialArguments({ chainId, store }: AdapterInitialArguments): void

  abstract getTradesHistoryForPair(inputToken: Token, outputToken: Token): Promise<void>
}

export class TradesAdapter {
  private _chainId: ChainId
  private _adapters: Adapters
  public readonly store: Store<AppState>

  private _initialized = false

  public get isInitialized() {
    return this._initialized
  }

  constructor({ adapters, chainId, store }: TradesHistoryAdapterConstructorParams) {
    this._adapters = adapters
    this._chainId = chainId
    this.store = store
  }

  public init = () => {
    this._initialized = true

    Object.values(this._adapters).forEach(adapter =>
      adapter.setInitialArguments({ chainId: this._chainId, store: this.store })
    )
  }

  public fetchTradesHistory = (inputToken: Token, outputToken: Token) => {
    Object.values(this._adapters).forEach(adapter => adapter.getTradesHistoryForPair(inputToken, outputToken))
  }

  public updateActiveChainId = (chainId: ChainId) => {
    Object.values(this._adapters).forEach(adapter => adapter.updateActiveChainId(chainId))
  }
}