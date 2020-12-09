import { Address, BigInt } from "@graphprotocol/graph-ts"
import { WrapperFactory, WrapperCreated } from "../generated/WrapperFactory/WrapperFactory"
import { ERC20 } from "../generated/WrapperFactory/ERC20"
import { ERC20bytes32 } from "../generated/WrapperFactory/ERC20bytes32"
import { Wrapped777 } from "../generated/schema"
import { Token } from "./lib/string"

export function handleWrapperCreated(event: WrapperCreated): void {
  let factory = WrapperFactory.bind(event.address)
  let wrapperAddress = factory.calculateWrapperAddress(event.params.token);

  let wrapper = new Wrapped777(wrapperAddress.toHex())

  wrapper.underlyingAddress = event.params.token

  let token = new Token(event.params.token)
  wrapper.underlyingName = token.name
  wrapper.underlyingSymbol = token.symbol
  wrapper.underlyingDecimals = token.decimals

  wrapper.save()
}
