import { Address } from "@graphprotocol/graph-ts"
import { IAdapterFactory, AdapterCreated } from "../generated/UniswapAdapterFactory/IAdapterFactory"
import { IWrapped777 } from "../generated/UniswapAdapterFactory/IWrapped777"
import { IUniswapV2Pair } from "../generated/UniswapAdapterFactory/IUniswapV2Pair"
import { UniswapAdapter, UniswapPoolWrapper } from "../generated/schema"

function getPair(wrapperAddress: Address): IUniswapV2Pair {
  let wrapper = IWrapped777.bind(wrapperAddress)
  let wrappedToken = wrapper.token()
  let pair = IUniswapV2Pair.bind(wrappedToken)
  return pair
}

export function handleAdapterCreated(event: AdapterCreated): void {
  let factory = IAdapterFactory.bind(event.address)

  let adapterAddress = factory.calculateAdapterAddress(event.params.outputWrapper)
  let outputWrapper = event.params.outputWrapper

  let adapter = new UniswapAdapter(adapterAddress.toHex())
  adapter.outputWrapper = event.params.outputWrapper.toHex()

  adapter.save()
}

export function handlePoolAdapterCreated(event: AdapterCreated): void {
  let factory = IAdapterFactory.bind(event.address)

  let adapterAddress = factory.calculateAdapterAddress(event.params.outputWrapper)
  let outputWrapper = event.params.outputWrapper

  let poolWrapper = UniswapPoolWrapper.load(outputWrapper.toHex())
  if (!poolWrapper) {
    poolWrapper = new UniswapPoolWrapper(outputWrapper.toHex())
    poolWrapper.wrapper = outputWrapper.toHex()

    let pair = getPair(outputWrapper)
    poolWrapper.token0Address = pair.token0()
    poolWrapper.token1Address = pair.token1()
    poolWrapper.save()
  }

  let adapter = new UniswapAdapter(adapterAddress.toHex())
  adapter.outputWrapper = event.params.outputWrapper.toHex()
  adapter.outputPoolWrapper = event.params.outputWrapper.toHex()

  adapter.save()
}
