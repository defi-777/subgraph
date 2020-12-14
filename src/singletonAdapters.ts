import { Address } from "@graphprotocol/graph-ts"
import { CompoundAdapter, MappingSet } from "../generated/CompoundAdapter/CompoundAdapter"
import { Adapter, Wrapped777 } from "../generated/schema"

let ZERO = Address.fromString('0x0000000000000000000000000000000000000000')
let COMPOUND_ETH = Address.fromString('0x0000000000000000000000000000000000000001')

function getAdapter(address: Address, protocol: String): Adapter {
  let adapter = Adapter.load(address.toHex())
  if (adapter == null) {
    adapter = new Adapter(address.toHex())
    adapter.protocol = protocol
    adapter.supportedWrappers = []
  }
  return adapter!
}

function setProtocol(wrapperAddress: Address, protocol: String): void {
  let wrapper = new Wrapped777(wrapperAddress.toHex())
  wrapper.protocol = protocol
  wrapper.save()
}

export function handleCompoundMappingSet(event: MappingSet): void {
  let adapter = getAdapter(event.address, 'Compound')

  let supportedWrappers = adapter.supportedWrappers

  if (event.params.input != COMPOUND_ETH) {
    supportedWrappers.push(event.params.input.toHex())
  }
  supportedWrappers.push(event.params.output.toHex())
  setProtocol(event.params.output, 'Compound')

  adapter.supportedWrappers = supportedWrappers
  adapter.save()
}

export function handleYVaultMappingSet(event: MappingSet): void {
  let adapter = getAdapter(event.address, 'yEarn')

  let supportedWrappers = adapter.supportedWrappers

  if (event.params.input != ZERO) {
    supportedWrappers.push(event.params.input.toHex())
  }
  supportedWrappers.push(event.params.output.toHex())
  setProtocol(event.params.output, 'yEarn')

  adapter.supportedWrappers = supportedWrappers
  adapter.save()
}
