import { ethereum, Bytes, Address } from "@graphprotocol/graph-ts"
import { ERC20 } from "../../generated/WrapperFactory/ERC20"
import { ERC20bytes32 } from "../../generated/WrapperFactory/ERC20bytes32"

export function tryStringCall(call: ethereum.CallResult<String>, fallback: String): String {
  if (call.reverted) {
    return fallback;
  }
  return call.value;
}

export function tryBytesStringCall(call: ethereum.CallResult<Bytes>, fallback: String): String {
  if (call.reverted) {
    return fallback;
  }
  return call.value.toString();
}

export class Token {
  address: Address
  name: String
  symbol: String

  constructor(address: Address) {
    let contract = ERC20.bind(address)
    this.address = address
    this.name = tryStringCall(contract.try_name(), 'UNKNOWN')
    this.symbol = tryStringCall(contract.try_symbol(), 'UNKNOWN')

    if (this.symbol === 'UNKNOWN') {
      let b32contract = ERC20bytes32.bind(address)
      this.name = tryBytesStringCall(b32contract.try_name(), 'UNKNOWN')
      this.symbol = tryBytesStringCall(b32contract.try_symbol(), 'UNKNOWN')
    }
  }
}
