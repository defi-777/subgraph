import { BigInt } from "@graphprotocol/graph-ts"
import { WrapperFactory, WrapperCreated } from "../generated/WrapperFactory/WrapperFactory"
import { ERC20 } from "../generated/WrapperFactory/ERC20"
import { Wrapped777 } from "../generated/schema"

export function handleWrapperCreated(event: WrapperCreated): void {
  let factory = WrapperFactory.bind(event.address)
  let wrapperAddress = factory.calculateWrapperAddress(event.params.token);

  let wrapper = new Wrapped777(event.transaction.from.toHex())

  wrapper.underlyingAddress = event.params.token

  let underlyingToken = ERC20.bind(event.params.token)

  wrapper.underlyingName = underlyingToken.try_name().value || 'FAIL'
  wrapper.underlyingSymbol = underlyingToken.try_symbol().value || 'FAIL'

  wrapper.save()
}
