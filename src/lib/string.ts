import { ethereum } from "@graphprotocol/graph-ts"

export function tryStringCall(call: ethereum.CallResult<String>, fallback: String): String {
  if (call.reverted) {
    return fallback;
  }
  return call.value;
}
