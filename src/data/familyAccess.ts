// The family passphrase gate. This is NOT the thing that stops outside
// traffic from costing money — that's the Worker's once-per-trading-day KV
// cache, which caps the blast radius regardless of who's asking. This is
// just the front door: enter the passphrase once, it's remembered on this
// device, and it's sent as the Bearer token on every daily-update request.
const TOKEN_KEY = 'kredoc.family.token.v1'

export function getFamilyToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function setFamilyToken(token: string): void {
  try {
    localStorage.setItem(TOKEN_KEY, token.trim())
  } catch {
    // storage unavailable — the gate will just re-prompt next load
  }
}

export function clearFamilyToken(): void {
  try {
    localStorage.removeItem(TOKEN_KEY)
  } catch {
    // ignore
  }
}
