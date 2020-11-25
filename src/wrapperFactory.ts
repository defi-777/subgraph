import { BigInt, ethereum } from "@graphprotocol/graph-ts"
import { WrapperFactory, WrapperCreated } from "../generated/WrapperFactory/WrapperFactory"
import { ERC20 } from "../generated/WrapperFactory/ERC20"
import { Wrapped777 } from "../generated/schema"

function tryStringCall(call: ethereum.CallResult<String>, fallback: String): String {
  if (call.reverted) {
    return fallback;
  }
  return call.value;
}

export function handleWrapperCreated(event: WrapperCreated): void {
  let factory = WrapperFactory.bind(event.address)
  let wrapperAddress = factory.calculateWrapperAddress(event.params.token);

  let wrapper = new Wrapped777(wrapperAddress.toHex())

  wrapper.underlyingAddress = event.params.token

  let underlyingToken = ERC20.bind(event.params.token)

  wrapper.underlyingName = tryStringCall(underlyingToken.try_name(), 'UNKNOWN')
  wrapper.underlyingSymbol = tryStringCall(underlyingToken.try_symbol(), 'UNKNOWN')

  wrapper.save()
}
