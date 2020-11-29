import { ethereum, Bytes } from "@graphprotocol/graph-ts"

export function tryStringCall(call: ethereum.CallResult<String>, fallback: String): String {
  if (call.reverted) {
    return fallback;
  }
  return call.value;
}

export function tryBytesStringCall(call: ethereum.CallResult<Bytes>, fallback: String): String {
  if (call.reverted) {
    return fallback;
  }
  return call.value.toString();
}
