import { Address, Bytes } from "@graphprotocol/graph-ts"
import { IAdapterFactory, AdapterCreated } from "../generated/BalancerPoolFactory/IAdapterFactory"
import { IWrapped777 } from "../generated/BalancerPoolFactory/IWrapped777"
import { BPool } from "../generated/BalancerPoolFactory/BPool"
import { Adapter, Wrapped777 } from "../generated/schema"
import { Token } from "./lib/string"

function getPool(wrapperAddress: Address): BPool {
  let wrapper = IWrapped777.bind(wrapperAddress)
  let wrappedToken = wrapper.token()
  let pair = BPool.bind(wrappedToken)
  return pair
}

export function handleAdapterCreated(event: AdapterCreated): void {
  let factory = IAdapterFactory.bind(event.address)

  let adapterAddress = factory.calculateAdapterAddress(event.params.outputWrapper)
  let outputWrapper = event.params.outputWrapper

  let poolWrapper = new Wrapped777(outputWrapper.toHex())
  poolWrapper.protocol = 'Balancer'

  let pool = getPool(outputWrapper)
  let tokens = pool.getCurrentTokens()
  let poolTokenAddresses = new Array<Bytes>(tokens.length)
  let poolTokenNames = new Array<string>(tokens.length)
  let poolTokenSymbols = new Array<string>(tokens.length)
  for (let i = 0, k = tokens.length; i < k; ++i) {
    let token = new Token(tokens[i])
    poolTokenAddresses[i] = token.address
    poolTokenNames[i] = token.name
    poolTokenSymbols[i] = token.symbol
  }
  poolWrapper.poolTokenAddresses = poolTokenAddresses
  poolWrapper.poolTokenNames = poolTokenNames
  poolWrapper.poolTokenSymbols = poolTokenSymbols


  let adapter = new Adapter(adapterAddress.toHex())
  adapter.outputWrapper = event.params.outputWrapper.toHex()
  adapter.protocol = 'Balancer'

  adapter.save()
  poolWrapper.save()
}

export function handleExitAdapterCreated(event: AdapterCreated): void {
  let factory = IAdapterFactory.bind(event.address)

  let adapterAddress = factory.calculateAdapterAddress(event.params.outputWrapper)
  let outputWrapper = event.params.outputWrapper

  let adapter = new Adapter(adapterAddress.toHex())
  adapter.protocol = 'Balancer'
  adapter.outputWrapper = event.params.outputWrapper.toHex()

  adapter.save()
}
