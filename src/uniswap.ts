import { Address } from "@graphprotocol/graph-ts"
import { ERC20 } from "../generated/UniswapAdapterFactory/ERC20"
import { ERC20bytes32 } from "../generated/WrapperFactory/ERC20bytes32"
import { IAdapterFactory, AdapterCreated } from "../generated/UniswapAdapterFactory/IAdapterFactory"
import { IWrapped777 } from "../generated/UniswapAdapterFactory/IWrapped777"
import { IUniswapV2Pair } from "../generated/UniswapAdapterFactory/IUniswapV2Pair"
import { Adapter, Wrapped777 } from "../generated/schema"
import { Token } from "./lib/string"

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

  let adapter = new Adapter(adapterAddress.toHex())
  adapter.protocol = 'Uniswap'
  adapter.outputWrapper = event.params.outputWrapper.toHex()

  adapter.save()
}

export function handlePoolAdapterCreated(event: AdapterCreated): void {
  let factory = IAdapterFactory.bind(event.address)

  let adapterAddress = factory.calculateAdapterAddress(event.params.outputWrapper)
  let outputWrapper = event.params.outputWrapper

  let poolWrapper = new Wrapped777(outputWrapper.toHex())
  poolWrapper.protocol = 'Uniswap'

  let pair = getPair(outputWrapper)
  let token0 = new Token(pair.token0() as Address)
  let token1 = new Token(pair.token1() as Address)

  poolWrapper.poolTokenAddresses = [token0.address, token1.address]
  poolWrapper.poolTokenNames = [token0.name, token1.name]
  poolWrapper.poolTokenSymbols = [token0.symbol, token1.symbol]

  poolWrapper.save()

  let adapter = new Adapter(adapterAddress.toHex())
  adapter.outputWrapper = event.params.outputWrapper.toHex()
  adapter.protocol = 'Uniswap'

  adapter.save()
}
