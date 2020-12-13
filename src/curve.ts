import { Address, Bytes } from "@graphprotocol/graph-ts"
import { CRVFarmerTokenFactory, WrapperCreated } from "../generated/CRVFarmerTokenFactory/CRVFarmerTokenFactory"
import { IFarmerToken } from "../generated/CRVFarmerTokenFactory/IFarmerToken"
import { AdapterRegistered } from "../generated/CurveRegistry/CurveRegistry"
import { SimpleAdapter } from "../generated/CurveRegistry/SimpleAdapter"
import { Adapter, Wrapped777 } from "../generated/schema"
import { Token } from "./lib/string"

export function handleNewCRVFarmerWrapper(event: WrapperCreated): void {
  let factory = CRVFarmerTokenFactory.bind(event.address)
  let wrapperAddress = factory.calculateWrapperAddress(event.params.token, event.params.gague)

  let wrapper = new Wrapped777(wrapperAddress.toHex())

  wrapper.underlyingAddress = event.params.token
  wrapper.protocol = 'Curve'

  let token = new Token(event.params.token)
  wrapper.underlyingName = token.name
  wrapper.underlyingSymbol = token.symbol
  wrapper.underlyingDecimals = token.decimals

  let farmerToken = IFarmerToken.bind(wrapperAddress)
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

export function handleAdapterRegistered(event: AdapterRegistered): void {
  let adapterContract = SimpleAdapter.bind(event.params.adapter)
  event.params.adapter
  event.params.isExit

  let adapter = new Adapter(event.params.adapter.toHex())

  let outputWrapper = adapterContract.wrapper()
  adapter.outputWrapper = outputWrapper.toHex()
  adapter.protocol = 'Curve'

  if (!event.params.isExit) {
    let wrapper = new Wrapped777(outputWrapper.toHex())
    wrapper.protocol = 'Curve'
    // TODO: set PoolToken values
    wrapper.save()
  }

  adapter.save()
}
