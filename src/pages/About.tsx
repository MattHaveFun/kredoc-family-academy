function About() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-widest text-sky-500">Our Mission</p>
      <h1 className="mt-1 text-2xl font-bold text-slate-50 sm:text-3xl">About Kredoc Family Academy</h1>

      <div className="mt-6 space-y-5 text-sm leading-relaxed text-slate-300 sm:text-base">
        <p>
          Kredoc Family Academy exists because financial literacy shouldn't be locked behind a trading
          terminal, a finance degree, or a family that happened to talk about money at the dinner table.
          We think the language of markets — indices, volatility, volume, candlesticks — is learnable by
          anyone willing to spend a few focused minutes with it.
        </p>
        <p>
          Most financial media is built for people who already know the vocabulary. It moves fast, assumes
          context, and rewards people who were already in the room. Kredoc is built for the opposite
          moment: the first time you see the word "VIX" and wonder what it actually means, or the first
          time a candlestick chart looks like a bar code instead of a story.
        </p>
        <p>
          So we built a dashboard that looks and feels like the tools professionals use — calm, dark,
          data-dense, unmistakably serious — and paired every single number on it with a plain-English
          answer to two questions: <span className="font-semibold text-slate-100">what is this</span>, and{' '}
          <span className="font-semibold text-slate-100">why should I care</span>. No panel exists on this
          site without an explanation standing next to it.
        </p>
        <p>
          That's the "Family" in Kredoc Family Academy: this is meant to be usable by a curious teenager,
          a parent trying to explain the news, or a grandparent wondering what everyone means by "the
          market." Confidence with money starts with being able to read the numbers — not with picking
          stocks, not with day-trading, just with understanding what's actually being said.
        </p>
        <p>
          Version 1 is a foundation: a live-feeling dashboard, a growing Academy of explainers, and a
          commitment to keep the two connected — every chart links to a lesson, and every lesson ties back
          to a real number you can watch move. What comes next builds on top of that: deeper lessons, more
          markets, and eventually a full knowledge graph connecting every concept to everything it touches.
        </p>
      </div>
    </div>
  )
}

export default About
