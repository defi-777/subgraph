import { Address, Bytes, BigInt } from "@graphprotocol/graph-ts"
import { CRVFarmerTokenFactory, WrapperCreated } from "../generated/CRVFarmerTokenFactory/CRVFarmerTokenFactory"
import { IFarmerToken } from "../generated/CRVFarmerTokenFactory/IFarmerToken"
import { ICurveDeposit } from "../generated/CurveRegistry/ICurveDeposit"
import { IWrapped777 } from "../generated/CurveRegistry/IWrapped777"
import { CurveRegistry, AdapterRegistered } from "../generated/CurveRegistry/CurveRegistry"
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

function setCurvePoolTokens(wrapper: Wrapped777, wrapperAddress: Address, registryAddress: Address): void {
  let registry = CurveRegistry.bind(registryAddress)
  let wrapperContract = IWrapped777.bind(wrapperAddress)

  let lpToken = wrapperContract.token()
  let depositorAddress = registry.getDepositorAddress(lpToken)
  let depositor = ICurveDeposit.bind(depositorAddress)

  let underlying = !depositor.try_underlying_coins(BigInt.fromI32(0)).reverted

  let poolTokenAddresses = new Array<Bytes>()
  let poolTokenNames = new Array<string>()
  let poolTokenSymbols = new Array<string>()
  for (let i = 0;; i += 1) {
    let coinAddressResult = underlying
      ? depositor.try_underlying_coins(BigInt.fromI32(i))
      : depositor.try_coins(BigInt.fromI32(i))

    if (coinAddressResult.reverted) {
      break
    }

    let token = new Token(coinAddressResult.value)
    poolTokenAddresses[i] = token.address
    poolTokenNames[i] = token.name
    poolTokenSymbols[i] = token.symbol
  }
  wrapper.poolTokenAddresses = poolTokenAddresses
  wrapper.poolTokenNames = poolTokenNames
  wrapper.poolTokenSymbols = poolTokenSymbols
}

export function handleAdapterRegistered(event: AdapterRegistered): void {
  let adapterContract = SimpleAdapter.bind(event.params.adapter)

  let adapter = new Adapter(event.params.adapter.toHex())

  let outputWrapper = adapterContract.wrapper()
  adapter.outputWrapper = outputWrapper.toHex()
  adapter.protocol = 'Curve'

  if (!event.params.isExit) {
    let wrapper = new Wrapped777(outputWrapper.toHex())
    wrapper.protocol = 'Curve'
    setCurvePoolTokens(wrapper, outputWrapper, event.address)
    wrapper.save()
  }

  adapter.save()
}
