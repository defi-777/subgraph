import { Address, Bytes } from "@graphprotocol/graph-ts"
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
  wrapper.underlyingDecimals = token.decimals

  let farmerToken = IFarmerToken.bind(event.params.wrapper)
  let yieldWrappers = farmerToken.rewardWrappers()
  let yieldWrapperAddresses = new Array<string>(yieldWrappers.length)
  let yieldAdapterAddresses = new Array<Bytes>(yieldWrappers.length)

  for (let i = 0, k = yieldWrappers.length; i < k; ++i) {
    yieldWrapperAddresses[i] = yieldWrappers[i].toHex()
    yieldAdapterAddresses[i] = farmerToken.getRewardAdapter(yieldWrappers[i])
  }
  wrapper.yieldWrappers = yieldWrapperAddresses
  wrapper.yieldAdapters = yieldAdapterAddresses

  wrapper.save()
}
