// The invite behind the Ambassador avatar.
//
// Deliberately client-only. Verifying that a friend actually arrived was built
// and then removed on purpose: it needed a signed code, a server round trip, a
// second secret, and a device id in localStorage — and clearing your browser
// data would silently change that id, killing every link you'd already sent.
// That is a lot of moving parts, and a confusing failure, in exchange for one
// badge on a family learning site. The reward is for the generous act instead:
// share the link, earn the avatar. Nothing to deploy, nothing to break.

/**
 * Hands the OS share sheet the link, or falls back to the clipboard.
 *
 * The two failure modes are not the same thing and must not be treated alike:
 *   'dismissed' — the share sheet opened and the person backed out. They chose
 *                 not to share, so nothing is earned.
 *   'blocked'   — the clipboard refused (insecure context, a locked-down
 *                 in-app browser, an unfocused window). The person did
 *                 everything right and the browser got in the way, so the
 *                 caller shows the link to copy by hand rather than leaving
 *                 them with a button that appears to do nothing.
 */
export async function shareInvite(): Promise<'shared' | 'copied' | 'dismissed' | 'blocked'> {
  const url = inviteUrl()
  const text = "I've been learning how markets actually work here — no jargon, no stock tips."
  if (navigator.share) {
    try {
      await navigator.share({ title: 'Kredoc Family Academy', text, url })
      return 'shared'
    } catch {
      return 'dismissed'
    }
  }
  try {
    await navigator.clipboard.writeText(`${text} ${url}`)
    return 'copied'
  } catch {
    return 'blocked'
  }
}

/** The link to hand out — just the site, no tracking parameter of any kind. */
export function inviteUrl(): string {
  return `${window.location.origin}${window.location.pathname}`
}
