import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { Profile } from '../context/ProfileContext'
import {
  ALL_AVATARS,
  AVATAR_GROUPS,
  avatarProgress,
  avatarUnlockHint,
  avatarUnlockLink,
  isAvatarUnlocked,
  isEquipped,
  type AvatarDef,
} from '../data/avatars'
import { inviteUrl, shareInvite } from '../data/invite'

// The grid of every avatar in the game — starters plus everything earnable.
// Locked tiles are dimmed to a lock icon, always say how to unlock, and — when
// there's somewhere to go — are themselves the link to the lesson that does it.
function AvatarTile({
  avatar,
  unlocked,
  equipped,
  profile,
  onSelect,
  onInvite,
}: {
  avatar: AvatarDef
  unlocked: boolean
  equipped: boolean
  profile: Profile
  onSelect: () => void
  onInvite: () => void
}) {
  const hint = avatarUnlockHint(avatar)
  const progress = unlocked ? null : avatarProgress(avatar, profile)
  const to = unlocked ? null : avatarUnlockLink(avatar, profile)
  const isInvite = !unlocked && avatar.unlock.type === 'invite'

  const shell = `group relative flex flex-col items-center gap-1.5 rounded-xl border p-3 text-center transition-all duration-200 ${
    equipped
      ? 'border-sky-400/50 bg-sky-400/[0.08] shadow-[0_0_20px_-8px_rgba(56,189,248,0.6)]'
      : unlocked
        ? 'border-slate-400/10 hover:-translate-y-0.5 hover:border-slate-400/30'
        : to || isInvite
          ? 'border-dashed border-slate-400/15 opacity-60 hover:-translate-y-0.5 hover:border-sky-400/40 hover:opacity-100'
          : 'cursor-default border-slate-400/5 opacity-40'
  }`

  const inner = (
    <>
      <span
        className="grid h-12 w-12 place-items-center rounded-full text-2xl transition-transform duration-200 group-hover:scale-105"
        style={{
          backgroundColor: unlocked ? `${avatar.color}1a` : 'rgba(148,163,184,0.08)',
          boxShadow: unlocked ? `inset 0 0 0 2px ${avatar.color}55` : 'inset 0 0 0 2px rgba(148,163,184,0.15)',
        }}
      >
        {unlocked ? avatar.emoji : '🔒'}
      </span>
      <span className="text-[11px] font-semibold leading-tight text-slate-200">{avatar.label}</span>
      {!unlocked && (
        <>
          <span className="text-[9px] leading-tight text-slate-600">{hint}</span>
          {progress && progress.target > 0 && (
            <span className="w-full">
              <span className="block h-0.5 w-full overflow-hidden rounded-full bg-slate-400/10">
                <span
                  className="block h-full rounded-full bg-sky-400/60"
                  style={{ width: `${Math.min(100, (progress.current / progress.target) * 100)}%` }}
                />
              </span>
              <span className="mt-1 block font-mono text-[9px] tabular-nums text-slate-600">
                {progress.current}/{progress.target}
              </span>
            </span>
          )}
          {(to || isInvite) && (
            <span className="font-mono text-[9px] uppercase tracking-wider text-sky-400/70 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              {isInvite ? 'Share →' : 'Go →'}
            </span>
          )}
        </>
      )}
      {equipped && (
        <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-sky-400 text-[10px] font-bold text-ink-950">
          ✓
        </span>
      )}
    </>
  )

  if (unlocked) {
    return (
      <button type="button" onClick={onSelect} title={`Wear ${avatar.label}`} className={shell}>
        {inner}
      </button>
    )
  }
  if (isInvite) {
    return (
      <button type="button" onClick={onInvite} title={hint} className={shell}>
        {inner}
      </button>
    )
  }
  if (to) {
    return (
      <Link to={to} title={hint} className={shell}>
        {inner}
      </Link>
    )
  }
  return (
    <div title={hint} className={shell}>
      {inner}
    </div>
  )
}

// The share panel that pays out the Ambassador avatar. Entirely local — see
// data/invite.ts for why the click is the proof.
function InviteFriend({ invited, onShared }: { invited: boolean; onShared: () => void }) {
  const [status, setStatus] = useState<'idle' | 'copied' | 'dismissed'>('idle')
  const [manualLink, setManualLink] = useState<string | null>(null)

  const share = async () => {
    const result = await shareInvite()
    if (result === 'dismissed') {
      setStatus('dismissed')
      setTimeout(() => setStatus('idle'), 2500)
      return
    }
    if (result === 'blocked') {
      // The browser wouldn't take the link; show it so it can be copied by
      // hand. They've done their part, so the avatar is theirs.
      setManualLink(inviteUrl())
    } else if (result === 'copied') {
      setStatus('copied')
      setTimeout(() => setStatus('idle'), 2500)
    }
    onShared()
  }

  return (
    <div className="rounded-xl border border-slate-400/10 bg-ink-950/40 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-200">
            {invited ? '🤝 Ambassador earned' : 'Know someone who should see this?'}
          </p>
          <p className="mt-0.5 text-xs text-slate-500">
            {invited
              ? 'Thanks for passing it on. Share it again anytime.'
              : 'Share the link and the Ambassador avatar is yours.'}
          </p>
        </div>
        <span className="flex items-center gap-3">
          {status === 'copied' && (
            <span className="font-mono text-[10px] uppercase tracking-wider text-up">Link copied</span>
          )}
          {status === 'dismissed' && (
            <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500">Not shared</span>
          )}
          <button
            type="button"
            onClick={share}
            className="rounded-lg bg-sky-400/15 px-4 py-2 font-mono text-xs font-semibold uppercase tracking-wider text-sky-300 ring-1 ring-inset ring-sky-400/40 transition-colors hover:bg-sky-400/25"
          >
            Invite a friend
          </button>
        </span>
      </div>

      {manualLink && (
        <div className="mt-3">
          <p className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
            Your browser wouldn't let the site copy it — here's the link
          </p>
          <input
            type="text"
            readOnly
            value={manualLink}
            onFocus={(e) => e.currentTarget.select()}
            className="mt-1.5 w-full select-all rounded-lg border border-slate-400/15 bg-ink-950/70 px-3 py-2 font-mono text-[11px] text-slate-200 focus:border-sky-400/50 focus:outline-none"
          />
        </div>
      )}
    </div>
  )
}

// The three locked avatars this profile is closest to. Turns a wall of locks
// into a short, achievable next step.
function NextUp({ profile }: { profile: Profile }) {
  const candidates = ALL_AVATARS.filter(
    // The crown is never a useful "next step" — it's the whole board at once,
    // and its starter-inflated ratio would otherwise crowd out real targets.
    (a) => a.unlock.type !== 'everything' && !isAvatarUnlocked(a, profile),
  )
    .map((a) => {
      const p = avatarProgress(a, profile)
      // Lesson avatars have no counter; rank them just behind anything already
      // part-way done so a fresh profile still sees a concrete first lesson.
      const ratio = p && p.target > 0 ? p.current / p.target : a.unlock.type === 'lesson' ? 0.05 : 0
      return { avatar: a, ratio, progress: p }
    })
    .filter((c) => c.ratio > 0 && c.ratio < 1)
    .sort((a, b) => b.ratio - a.ratio)
    .slice(0, 3)

  if (candidates.length === 0) return null

  return (
    <div className="rounded-xl border border-sky-400/15 bg-sky-400/[0.04] p-4">
      <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-sky-300">Closest to earning</p>
      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        {candidates.map(({ avatar, progress }) => {
          const to = avatarUnlockLink(avatar, profile)
          const body = (
            <>
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-slate-400/10 text-sm">🔒</span>
              <span className="min-w-0">
                <span className="block truncate text-xs font-semibold text-slate-200">{avatar.label}</span>
                <span className="block truncate text-[10px] text-slate-500">
                  {progress ? `${progress.current}/${progress.target} · ` : ''}
                  {avatarUnlockHint(avatar)}
                </span>
              </span>
            </>
          )
          return to ? (
            <Link
              key={avatar.id}
              to={to}
              className="flex items-center gap-2.5 rounded-lg border border-slate-400/10 p-2.5 transition-colors hover:border-sky-400/40"
            >
              {body}
            </Link>
          ) : (
            <span key={avatar.id} className="flex items-center gap-2.5 rounded-lg border border-slate-400/10 p-2.5">
              {body}
            </span>
          )
        })}
      </div>
    </div>
  )
}

function AvatarPicker({
  profile,
  onSelect,
  onInvited,
}: {
  profile: Profile
  onSelect: (avatarId: string) => void
  onInvited: () => void
}) {
  const unlockedCount = ALL_AVATARS.filter((a) => isAvatarUnlocked(a, profile)).length

  // Clicking the locked Ambassador tile runs the same share the panel button
  // does — a tile that only tells you what to do is a dead end.
  const inviteFromTile = async () => {
    // Only a deliberate back-out earns nothing; a browser that blocked the
    // clipboard shouldn't cost anyone the avatar.
    if ((await shareInvite()) !== 'dismissed') onInvited()
  }

  return (
    <div className="space-y-6">
      <p className="text-xs text-slate-500">
        <span className="font-mono font-semibold text-slate-300">
          {unlockedCount}/{ALL_AVATARS.length}
        </span>{' '}
        unlocked. Every locked avatar tells you how to earn it — and most of them are a link straight to the
        lesson that does.
      </p>

      <NextUp profile={profile} />
      <InviteFriend invited={profile.invitedFriend} onShared={onInvited} />

      {AVATAR_GROUPS.map((group) => (
        <div key={group.title}>
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-600">
            {group.title}
            <span className="ml-2 font-sans normal-case tracking-normal text-slate-700">{group.blurb}</span>
          </p>
          <div className="mt-3 grid grid-cols-3 gap-2.5 sm:grid-cols-4 md:grid-cols-6">
            {group.avatars.map((avatar) => (
              <AvatarTile
                key={avatar.id}
                avatar={avatar}
                profile={profile}
                unlocked={isAvatarUnlocked(avatar, profile)}
                equipped={isEquipped(avatar, profile)}
                onSelect={() => onSelect(avatar.id)}
                onInvite={inviteFromTile}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default AvatarPicker
