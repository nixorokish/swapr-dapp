import React, { useState } from 'react'
import styled from 'styled-components'
import { Currency, Token, WETH } from 'dxswap-sdk'

import EthereumLogo from '../../assets/images/ethereum-logo.png'

const getTokenLogoURL = address =>
  `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${address}/logo.png`
const NO_LOGO_ADDRESSES: { [tokenAddress: string]: true } = {}

const Image = styled.img<{ size: string }>`
  width: ${({ size }) => size};
  height: ${({ size }) => size};
  background-color: white;
  border-radius: 1rem;
  box-shadow: 0px 6px 10px rgba(0, 0, 0, 0.075);
`

const Emoji = styled.span<{ size?: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${({ size }) => size};
  width: ${({ size }) => size};
  height: ${({ size }) => size};
  margin-bottom: -4px;
`

const StyledEthereumLogo = styled.img<{ size: string }>`
  width: ${({ size }) => size};
  height: ${({ size }) => size};
  box-shadow: 0px 6px 10px rgba(0, 0, 0, 0.075);
  border-radius: 24px;
`

export default function CurrencyLogo({
  currency,
  size = '24px',
  ...rest
}: {
  currency?: Currency
  size?: string
  style?: React.CSSProperties
}) {
  const [, refresh] = useState<number>(0)

  if (currency instanceof Token) {
    let path = ''
    if (!NO_LOGO_ADDRESSES[currency.address]) {
      path = getTokenLogoURL(currency.address)
    } else {
      return (
        <Emoji {...rest} size={size}>
          <span role="img" aria-label="Thinking">
            🤔
          </span>
        </Emoji>
      )
    }
    // hard code to show ETH instead of WETH in UI
    if (currency.address === WETH[currency.chainId].address) {
      return <StyledEthereumLogo src={EthereumLogo} size={size} {...rest} />
    } else if (currency.address == "0xDd25BaE0659fC06a8d00CD06C7f5A98D71bfB715") {
      path = "https://gateway.pinata.cloud/ipfs/QmPhoeL14E5SBFBaC4bA3nuRpg3MpxdWVYdPrdXHdQ3EHY/brand/dxdao-blue.png"
    }
    return (
      <Image
        {...rest}
        alt={`${currency.name} Logo`}
        src={path}
        size={size}
        onError={() => {
          if (currency instanceof Token) {
            NO_LOGO_ADDRESSES[currency.address] = true
          }
          refresh(i => i + 1)
        }}
      />
    )
  } else {
    return <StyledEthereumLogo src={EthereumLogo} size={size} {...rest} />
  }
}
