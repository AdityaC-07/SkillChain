export function shorten(address){ if (!address) return ''; return address.slice(0,6) + '...' + address.slice(-4) }

export function isValidAddress(address){
  return /^0x[a-fA-F0-9]{40}$/.test(address || '')
}
