import { Address } from "@graphprotocol/graph-ts"
import { WrapperCreated } from "../generated/FarmerTokenFactory/FarmerTokenFactory"
import { IFarmerToken } from "../generated/FarmerTokenFactory/IFarmerToken"
import { Wrapped777 } from "../generated/schema"
import { Token } from "./lib/string"

export function handleWrapperCreated(event: WrapperCreated): void {
  let wrapper = new Wrapped777(event.params.wrapper.toHex())

  wrapper.underlyingAddress = event.params.token

  let token = new Token(event.params.token)
  wrapper.underlyingName = token.name
  wrapper.underlyingSymbol = token.symbol
  let yieldWrappers = IFarmerToken.bind(event.params.wrapper).rewardWrappers()
  let yieldWrapperIDs = new Array<string>(yieldWrappers.length)
  for (let i = 0, k = yieldWrappers.length; i < k; ++i) {
    yieldWrapperIDs[i] = yieldWrappers[i].toHex()
  }
  wrapper.yieldWrappers = yieldWrapperIDs

  wrapper.save()
}
