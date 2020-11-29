import { Address } from "@graphprotocol/graph-ts"
import { ERC20 } from "../generated/UniswapAdapterFactory/ERC20"
import { ERC20bytes32 } from "../generated/WrapperFactory/ERC20bytes32"
import { IAdapterFactory, AdapterCreated } from "../generated/UniswapAdapterFactory/IAdapterFactory"
import { IWrapped777 } from "../generated/UniswapAdapterFactory/IWrapped777"
import { IUniswapV2Pair } from "../generated/UniswapAdapterFactory/IUniswapV2Pair"
import { UniswapAdapter, UniswapPoolWrapper } from "../generated/schema"
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
    let token0 = new Token(poolWrapper.token0Address as Address)
    poolWrapper.token0Name = token0.name
    poolWrapper.token0Symbol = token0.symbol

    poolWrapper.token1Address = pair.token1()
    let token1 = new Token(poolWrapper.token1Address as Address)
    poolWrapper.token1Name = token1.name
    poolWrapper.token1Symbol = token1.symbol

    poolWrapper.save()
  }

  let adapter = new UniswapAdapter(adapterAddress.toHex())
  adapter.outputWrapper = event.params.outputWrapper.toHex()
  adapter.outputPoolWrapper = event.params.outputWrapper.toHex()

  adapter.save()
}
