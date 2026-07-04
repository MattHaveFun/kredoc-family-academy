function About() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <header className="animate-fade-up">
        <p className="eyebrow">Our Mission</p>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-slate-50 sm:text-4xl">
          About Kredoc Family Academy
        </h1>
      </header>

      <div className="mt-8 animate-fade-up space-y-6" style={{ animationDelay: '100ms' }}>
        <p className="text-lg leading-relaxed text-slate-200">
          Kredoc Family Academy exists because financial literacy shouldn't be locked behind a
          trading terminal, a finance degree, or a family that happened to talk about money at the
          dinner table. We think the language of markets — indices, volatility, volume,
          candlesticks — is learnable by anyone willing to spend a few focused minutes with it.
        </p>

        <p className="text-sm leading-relaxed text-slate-300 sm:text-base">
          Most financial media is built for people who already know the vocabulary. It moves fast,
          assumes context, and rewards people who were already in the room. Kredoc is built for the
          opposite moment: the first time you see the word "VIX" and wonder what it actually means,
          or the first time a candlestick chart looks like a bar code instead of a story.
        </p>

        <div className="panel p-6 sm:p-7">
          <p className="text-sm leading-relaxed text-slate-300 sm:text-base">
            So we built a dashboard that looks and feels like the tools professionals use — calm,
            dark, data-dense, unmistakably serious — and paired every single number on it with a
            plain-English answer to two questions:{' '}
            <span className="font-semibold text-sky-300">what is this</span>, and{' '}
            <span className="font-semibold text-amber-300">why should I care</span>. No panel
            exists on this site without an explanation standing next to it.
          </p>
        </div>

        <p className="text-sm leading-relaxed text-slate-300 sm:text-base">
          That's the "Family" in Kredoc Family Academy: this is meant to be usable by a curious
          teenager, a parent trying to explain the news, or a grandparent wondering what everyone
          means by "the market." Confidence with money starts with being able to read the numbers —
          not with picking stocks, not with day-trading, just with understanding what's actually
          being said.
        </p>

        <p className="text-sm leading-relaxed text-slate-300 sm:text-base">
          And here's the part that matters: finance is only Chapter 1. Markets are the gateway
          drug, not the destination. The real curriculum is judgment — understanding incentives,
          spotting bad arguments, sizing risks, thinking in decades. The Academy grows one chapter
          at a time, and the family votes on what gets built next. Every chart links to a lesson,
          every lesson connects to a knowledge map, and every number on the site is labeled honestly
          — today's close, cached, or unavailable — because a site about clear thinking shouldn't
          fake anything, ever.
        </p>

        <div className="flex items-center gap-4 pt-4">
          <span className="h-px flex-1 bg-gradient-to-r from-slate-400/20 to-transparent" />
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-slate-600">
            Calm · Clear · Learnable
          </span>
        </div>
      </div>
    </div>
  )
}

export default About
