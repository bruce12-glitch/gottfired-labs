import { useState, type FormEvent } from 'react';
import { ArrowDown, ArrowUpRight, Check, Github, Mail, Menu, Pause, Play, RotateCcw, X } from 'lucide-react';

function ComputeForm({ paused, resetSignal }: { paused: boolean; resetSignal: number }) {
  return (
    <div
      className={`compute-form ${paused ? 'is-paused' : ''}`}
      style={{ animationDelay: `${resetSignal * -0.35}s` }}
      aria-label="Animated three-dimensional form representing efficient computation"
      role="img"
    >
      <div className="compute-shadow" />
      <div className="compute-orbit">
        <span className="compute-bead" />
      </div>
      <div className="compute-core" />
    </div>
  );
}

function App() {
  const [paused, setPaused] = useState(false);
  const [resetSignal, setResetSignal] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sent, setSent] = useState(false);

  const navigate = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMobileOpen(false);
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSent(true);
  };

  return (
    <main className="lab-shell min-h-[100dvh]">
      <header className="fixed left-0 right-0 top-0 z-20 border-b hairline bg-[#f5f1e8]/90 backdrop-blur-md">
        <div className="mx-auto flex h-[76px] max-w-[1240px] items-center justify-between px-5 sm:px-8 lg:px-10">
          <button onClick={() => navigate('top')} className="flex items-center gap-3 text-left" data-testid="button-brand-top">
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#ba6748]">
              <span className="h-2.5 w-2.5 rounded-full bg-[#ba6748]" />
            </span>
            <span className="font-display text-[13px] font-semibold leading-[1.05] tracking-[-.02em] text-[#292722]">
              GOTTFRIED
              <br />
              <span className="text-[10px] font-normal tracking-[.08em] text-[#6b645b]">COMPUTING LAB</span>
            </span>
          </button>
          <nav className="hidden items-center gap-8 md:flex" aria-label="Main navigation">
            {['focus', 'work', 'principles', 'contact'].map((item) => (
              <button key={item} onClick={() => navigate(item)} className="nav-link text-[13px]" data-testid={`link-nav-${item}`}>
                {item}
              </button>
            ))}
          </nav>
          <div className="hidden items-center sm:flex">
            <button onClick={() => navigate('contact')} className="outline-button flex items-center border hairline px-4 py-2 text-[13px] text-[#292722]" data-testid="button-nav-connect">
              Start a conversation
              <ArrowUpRight size={14} className="ml-2" />
            </button>
          </div>
          <button className="text-[#292722] sm:hidden" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu" data-testid="button-mobile-menu">
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
        {mobileOpen && (
          <div className="border-t hairline bg-[#f5f1e8] px-5 py-5 sm:hidden">
            <div className="flex flex-col gap-5">
              {['focus', 'work', 'principles', 'contact'].map((item) => (
                <button key={item} onClick={() => navigate(item)} className="nav-link text-left text-[14px]" data-testid={`link-mobile-${item}`}>
                  {item}
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      <section id="top" className="mx-auto grid min-h-[760px] max-w-[1240px] items-center gap-12 px-5 pb-24 pt-36 sm:px-8 lg:grid-cols-[.92fr_1.08fr] lg:gap-8 lg:px-10 lg:pt-40">
        <div className="relative z-10 max-w-[560px]">
          <div className="reveal mb-8 flex items-center gap-3 text-[13px] text-[#ba6748]">
            <span className="h-px w-8 bg-[#ba6748]" />
            Independent research lab
          </div>
          <h1 className="reveal reveal-delay-1 font-display text-[clamp(3.8rem,8.5vw,7.4rem)] font-medium leading-[.88] tracking-[-.035em] text-[#292722]">
            Intelligence,
            <br />
            <span className="text-[#ba6748]">with less</span>
            <br />
            in the way.
          </h1>
          <p className="reveal reveal-delay-2 mt-9 max-w-[470px] text-[17px] leading-7 text-[#625d54] sm:text-[18px]">
            Gottfried Computing Lab builds practical systems for efficient LLM inference and machine learning.
          </p>
          <div className="reveal reveal-delay-3 mt-9 flex flex-wrap items-center gap-6">
            <button onClick={() => navigate('work')} className="accent-button bg-[#ba6748] px-5 py-3 text-[13px] text-[#fffaf2]" data-testid="button-hero-work">
              See the work
              <ArrowDown size={14} className="ml-3 inline" />
            </button>
            <button onClick={() => navigate('focus')} className="nav-link text-[13px]" data-testid="button-hero-focus">
              What we focus on
              <ArrowUpRight size={14} className="ml-2 inline" />
            </button>
          </div>
        </div>

        <div className="reveal reveal-delay-2 relative mt-4 flex aspect-[1.1/1] min-h-[390px] w-full items-center justify-center overflow-hidden rounded-[2px] border hairline bg-[#eee8dc] lg:mt-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(255,252,244,.76),transparent_54%)]" />
          <ComputeForm paused={paused} resetSignal={resetSignal} />
          <div className="absolute bottom-4 right-4 flex items-center gap-2">
            <button
              onClick={() => setPaused(!paused)}
              className="rounded-full p-2 text-[#71695e] transition-colors hover:bg-[#f5f1e8] hover:text-[#ba6748]"
              aria-label={paused ? 'Resume preview animation' : 'Pause preview animation'}
              title={paused ? 'Resume preview' : 'Pause preview'}
              data-testid="button-toggle-animation"
            >
              {paused ? <Play size={14} /> : <Pause size={14} />}
            </button>
            <button
              onClick={() => setResetSignal((value) => value + 1)}
              className="rounded-full p-2 text-[#71695e] transition-colors hover:bg-[#f5f1e8] hover:text-[#ba6748]"
              aria-label="Reset preview animation"
              title="Reset preview"
              data-testid="button-reset-preview"
            >
              <RotateCcw size={14} />
            </button>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1240px] px-5 sm:px-8 lg:px-10">
        <div className="axis-rule h-px w-full" />
      </div>

      <section id="focus" className="mx-auto max-w-[1240px] px-5 py-28 sm:px-8 lg:px-10 lg:py-36">
        <div className="grid gap-12 lg:grid-cols-[.62fr_1fr] lg:gap-24">
          <div>
            <div className="text-[13px] text-[#ba6748]">01 / Focus</div>
            <h2 className="mt-6 max-w-[420px] font-display text-4xl leading-[1.02] tracking-[-.02em] text-[#292722] sm:text-5xl">
              Useful intelligence starts with the machine.
            </h2>
          </div>
          <div className="max-w-[620px]">
            <p className="text-xl leading-8 text-[#454139] sm:text-2xl sm:leading-9">
              We work on the space between capable models and the hardware that has to carry them.
            </p>
            <div className="mt-12 grid gap-0 border-t hairline">
              {[
                ['Efficient inference', 'Making language models faster and smaller without losing what makes them useful.'],
                ['Machine-aware systems', 'Designing around memory, bandwidth, and the real conditions of deployment.'],
                ['Open research', 'Sharing tools and findings that make better systems easier to build.'],
              ].map(([title, copy], index) => (
                <article key={title} className="grid gap-4 border-b hairline py-7 sm:grid-cols-[30px_1fr]">
                  <span className="text-[13px] text-[#ba6748]">0{index + 1}</span>
                  <div>
                    <h3 className="font-display text-xl tracking-[-.025em] text-[#292722]">{title}</h3>
                    <p className="mt-2 max-w-[500px] text-[15px] leading-6 text-[#6a645a]">{copy}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="work" className="border-y hairline bg-[#eee8dc]">
        <div className="mx-auto max-w-[1240px] px-5 py-28 sm:px-8 lg:px-10 lg:py-36">
          <div className="flex flex-col justify-between gap-7 sm:flex-row sm:items-end">
            <div>
              <div className="text-[13px] text-[#ba6748]">02 / Selected work</div>
              <h2 className="mt-5 font-display text-4xl tracking-[-.02em] text-[#292722] sm:text-5xl">A few open questions.</h2>
            </div>
            <p className="max-w-[260px] text-[14px] leading-6 text-[#6a645a]">Research made concrete through notes, tools, and experiments.</p>
          </div>
          <div className="mt-14 grid gap-4 lg:grid-cols-[1.18fr_.82fr]">
            <article className="work-card group border hairline bg-[#f5f1e8] p-7 sm:p-10">
              <div className="flex items-start justify-between text-[13px] text-[#ba6748]">
                <span>Systems note</span>
                <ArrowUpRight size={17} className="transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
              </div>
                <h3 className="mt-20 max-w-[570px] font-display text-3xl leading-[1.08] tracking-[-.015em] text-[#292722] sm:text-4xl">
                The cost of a token is mostly where you choose to move it.
              </h3>
              <p className="mt-6 max-w-[550px] text-[15px] leading-6 text-[#6a645a]">
                A field guide to memory movement in long-context inference and the architectural decisions that compound at scale.
              </p>
              <button onClick={() => navigate('contact')} className="nav-link mt-10 text-[13px]" data-testid="button-work-note">
                Discuss this work <ArrowUpRight size={13} className="ml-1 inline" />
              </button>
            </article>
            <div className="grid gap-4">
              {[
                ['Benchmarking the whole request', 'A better way to compare latency, energy, and quality.'],
                ['Routing sparsity without the mystery', 'Making selective computation easier to reason about.'],
              ].map(([title, copy], index) => (
                <article key={title} className="work-card group border hairline bg-[#f5f1e8] p-7">
                  <div className="flex justify-between text-[13px] text-[#ba6748]">
                    <span>Note 0{index + 2}</span>
                    <ArrowUpRight size={16} className="transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
                  </div>
                  <h3 className="mt-12 max-w-[330px] font-display text-2xl leading-[1.1] tracking-[-.01em] text-[#292722]">{title}</h3>
                  <p className="mt-5 max-w-[360px] text-[14px] leading-6 text-[#6a645a]">{copy}</p>
                </article>
              ))}
            </div>
          </div>
          <button onClick={() => window.open('https://github.com', '_blank', 'noopener,noreferrer')} className="outline-button mt-8 border hairline px-5 py-3 text-[13px] text-[#292722]" data-testid="button-github">
            <Github size={15} className="mr-2 inline" />
            Browse open work
            <ArrowUpRight size={13} className="ml-2 inline" />
          </button>
        </div>
      </section>

      <section id="principles" className="mx-auto max-w-[1240px] px-5 py-28 sm:px-8 lg:px-10 lg:py-36">
        <div className="grid gap-14 lg:grid-cols-[.62fr_1fr] lg:gap-24">
          <div>
            <div className="text-[13px] text-[#ba6748]">03 / Principles</div>
            <h2 className="mt-5 font-display text-4xl leading-[1.02] tracking-[-.02em] text-[#292722] sm:text-5xl">
              Small team.
              <br />
              Long horizon.
            </h2>
          </div>
          <div className="grid gap-0 border-t hairline">
            {[
              ['Rigor', 'Stay close to the hardware. A useful result survives measurement.'],
              ['Leverage', 'Look for the insight that changes the shape of the problem.'],
              ['Candor', 'Share trade-offs and failure modes, not just the polished result.'],
            ].map(([title, copy], index) => (
              <div key={title} className="grid gap-4 border-b hairline py-7 sm:grid-cols-[110px_1fr]">
                <span className="text-[13px] text-[#ba6748]">0{index + 1} — {title}</span>
                <p className="max-w-[520px] text-[15px] leading-6 text-[#625d54]">{copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="border-t hairline bg-[#e8dfd1]">
        <div className="mx-auto grid max-w-[1240px] gap-16 px-5 py-28 sm:px-8 lg:grid-cols-[1fr_.8fr] lg:gap-28 lg:px-10 lg:py-36">
          <div>
            <div className="text-[13px] text-[#ba6748]">04 / Contact</div>
            <h2 className="mt-5 max-w-[620px] font-display text-5xl leading-[.95] tracking-[-.025em] text-[#292722] sm:text-7xl">Bring us a hard problem.</h2>
            <p className="mt-8 max-w-[490px] text-[16px] leading-7 text-[#625d54]">
              Tell us what the machine is doing, what it should be doing, and where it gets expensive.
            </p>
            <a href="mailto:hello@gottfried.ai" className="nav-link mt-9 inline-flex items-center text-[15px] text-[#ba6748]" data-testid="link-email">
              <Mail size={16} className="mr-3" />
              hello@gottfried.ai
              <ArrowUpRight size={14} className="ml-2" />
            </a>
          </div>
          <form onSubmit={submit} className="border hairline bg-[#f5f1e8] p-6 sm:p-8">
            {sent ? (
              <div className="flex min-h-[280px] flex-col justify-center">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#ba6748] text-[#fffaf2]"><Check size={18} /></div>
                <h3 className="mt-6 font-display text-2xl text-[#292722]">Message noted.</h3>
                <p className="mt-3 text-[15px] leading-6 text-[#6a645a]">We will read it carefully and reply to the address you shared.</p>
                <button type="button" onClick={() => setSent(false)} className="nav-link mt-8 self-start text-[13px]" data-testid="button-send-another">
                  Send another <ArrowUpRight size={12} className="ml-1 inline" />
                </button>
              </div>
            ) : (
              <>
                <div className="mb-8 text-[13px] text-[#6a645a]">Start a conversation</div>
                <label className="block text-[13px] text-[#625d54]">
                  Your email
                  <input required type="email" placeholder="you@company.com" className="mt-3 w-full border-b border-[#bdb3a5] bg-transparent px-0 py-3 text-[15px] text-[#292722] outline-none placeholder:text-[#9d9488] focus:border-[#ba6748]" data-testid="input-email" />
                </label>
                <label className="mt-8 block text-[13px] text-[#625d54]">
                  The problem
                  <textarea required placeholder="What are you working on?" rows={3} className="mt-3 w-full resize-none border-b border-[#bdb3a5] bg-transparent px-0 py-3 text-[15px] leading-6 text-[#292722] outline-none placeholder:text-[#9d9488] focus:border-[#ba6748]" data-testid="input-message" />
                </label>
                <button type="submit" className="accent-button mt-9 bg-[#ba6748] px-5 py-3 text-[13px] text-[#fffaf2]" data-testid="button-submit-contact">
                  Send note <ArrowUpRight size={13} className="ml-2 inline" />
                </button>
              </>
            )}
          </form>
        </div>
      </section>

      <footer className="mx-auto flex max-w-[1240px] flex-col gap-5 px-5 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10">
        <div className="text-[13px] text-[#746d63]">Gottfried Computing Lab <span className="mx-2 text-[#b7ac9c]">/</span> Useful intelligence, thoughtfully made.</div>
        <div className="flex gap-6 text-[13px] text-[#746d63]">
          <button onClick={() => navigate('top')} className="nav-link" data-testid="button-back-top">Back to top</button>
          <span>© 2025 GCL</span>
        </div>
      </footer>
    </main>
  );
}

export default App;