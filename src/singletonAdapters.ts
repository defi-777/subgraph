import { Address } from "@graphprotocol/graph-ts"
import { CompoundAdapter, MappingSet } from "../generated/CompoundAdapter/CompoundAdapter"
import { Adapter } from "../generated/schema"

let COMPOUND_ETH = Address.fromString('0x0000000000000000000000000000000000000001')

function getCompoundAdapter(address: Address): Adapter {
  let adapter = Adapter.load(address.toHex())
  if (adapter == null) {
    adapter = new Adapter(address.toHex())
    adapter.protocol = 'Compound'
    adapter.supportedWrappers = []
  }
  return adapter!
}

export function handleCompoundMappingSet(event: MappingSet): void {
  let adapter = getCompoundAdapter(event.address)

  let supportedWrappers = adapter.supportedWrappers

  if (event.params.input != COMPOUND_ETH) {
    supportedWrappers.push(event.params.output.toHex())
  }
  supportedWrappers.push(event.params.output.toHex())

  adapter.supportedWrappers = supportedWrappers
  adapter.save()
}
