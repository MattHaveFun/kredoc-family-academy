import type { Profile } from '../context/ProfileContext'
import {
  ALL_AVATARS,
  LESSON_AVATARS,
  MILESTONE_AVATARS,
  STARTER_AVATARS,
  TIME_AVATARS,
  avatarUnlockHint,
  isAvatarUnlocked,
  type AvatarDef,
} from '../data/avatars'

// The grid of every avatar in the game — starters plus everything earnable.
// Locked tiles are dimmed to a lock icon and always show how to unlock them,
// per the "tell them how to earn it" requirement.
function AvatarTile({
  avatar,
  unlocked,
  equipped,
  onSelect,
}: {
  avatar: AvatarDef
  unlocked: boolean
  equipped: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      disabled={!unlocked}
      onClick={onSelect}
      title={unlocked ? avatar.label : avatarUnlockHint(avatar)}
      className={`group relative flex flex-col items-center gap-1.5 rounded-xl border p-3 text-center transition-all duration-200 ${
        equipped
          ? 'border-sky-400/50 bg-sky-400/[0.08] shadow-[0_0_20px_-8px_rgba(56,189,248,0.6)]'
          : unlocked
            ? 'border-slate-400/10 hover:-translate-y-0.5 hover:border-slate-400/30'
            : 'cursor-not-allowed border-slate-400/5 opacity-40'
      }`}
    >
      <span
        className="grid h-12 w-12 place-items-center rounded-full text-2xl"
        style={{
          backgroundColor: unlocked ? `${avatar.color}1a` : 'rgba(148,163,184,0.08)',
          boxShadow: unlocked ? `inset 0 0 0 2px ${avatar.color}55` : 'inset 0 0 0 2px rgba(148,163,184,0.15)',
        }}
      >
        {unlocked ? avatar.emoji : '🔒'}
      </span>
      <span className="text-[11px] font-semibold leading-tight text-slate-200">{avatar.label}</span>
      {!unlocked && <span className="text-[9px] leading-tight text-slate-600">{avatarUnlockHint(avatar)}</span>}
      {equipped && (
        <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-sky-400 text-[10px] font-bold text-ink-950">
          ✓
        </span>
      )}
    </button>
  )
}

function AvatarGroup({
  title,
  avatars,
  profile,
  onSelect,
}: {
  title: string
  avatars: AvatarDef[]
  profile: Profile
  onSelect: (id: string) => void
}) {
  return (
    <div>
      <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-600">{title}</p>
      <div className="mt-3 grid grid-cols-3 gap-2.5 sm:grid-cols-4 md:grid-cols-6">
        {avatars.map((avatar) => (
          <AvatarTile
            key={avatar.id}
            avatar={avatar}
            unlocked={isAvatarUnlocked(avatar, profile)}
            equipped={profile.emoji === avatar.emoji && profile.color === avatar.color}
            onSelect={() => onSelect(avatar.id)}
          />
        ))}
      </div>
    </div>
  )
}

function AvatarPicker({ profile, onSelect }: { profile: Profile; onSelect: (avatarId: string) => void }) {
  const unlockedCount = ALL_AVATARS.filter((a) => isAvatarUnlocked(a, profile)).length

  return (
    <div className="space-y-6">
      <p className="text-xs text-slate-500">
        {unlockedCount}/{ALL_AVATARS.length} unlocked. Complete lessons and hit milestones to earn more — every
        locked avatar shows how to get it.
      </p>
      <AvatarGroup title="Starter" avatars={STARTER_AVATARS} profile={profile} onSelect={onSelect} />
      <AvatarGroup title="Milestones" avatars={MILESTONE_AVATARS} profile={profile} onSelect={onSelect} />
      <AvatarGroup title="Special" avatars={TIME_AVATARS} profile={profile} onSelect={onSelect} />
      <AvatarGroup title="Lesson rewards" avatars={LESSON_AVATARS} profile={profile} onSelect={onSelect} />
    </div>
  )
}

export default AvatarPicker
