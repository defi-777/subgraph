import { Address, BigInt } from "@graphprotocol/graph-ts"
import { WrapperFactory, WrapperCreated } from "../generated/WrapperFactory/WrapperFactory"
import { ERC20 } from "../generated/WrapperFactory/ERC20"
import { ERC20bytes32 } from "../generated/WrapperFactory/ERC20bytes32"
import { Wrapped777 } from "../generated/schema"
import { tryStringCall, tryBytesStringCall } from "./lib/string"

export class Token {
  name: String;
  symbol: String;

  constructor(address: Address) {
    let contract = ERC20.bind(address)
    this.name = tryStringCall(contract.try_name(), 'UNKNOWN')
    this.symbol = tryStringCall(contract.try_symbol(), 'UNKNOWN')

    if (this.symbol === 'UNKNOWN') {
      let b32contract = ERC20bytes32.bind(address)
      this.name = tryBytesStringCall(b32contract.try_name(), 'UNKNOWN')
      this.symbol = tryBytesStringCall(b32contract.try_symbol(), 'UNKNOWN')
    }
  }
}

export function handleWrapperCreated(event: WrapperCreated): void {
  let factory = WrapperFactory.bind(event.address)
  let wrapperAddress = factory.calculateWrapperAddress(event.params.token);

  let wrapper = new Wrapped777(wrapperAddress.toHex())

  wrapper.underlyingAddress = event.params.token

  let token = new Token(event.params.token)
  wrapper.underlyingName = token.name
  wrapper.underlyingSymbol = token.symbol

  wrapper.save()
}
