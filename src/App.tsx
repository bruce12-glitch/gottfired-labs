import { useEffect, useRef, useState, type FormEvent } from 'react';
import { ArrowDown, ArrowUpRight, Check, Github, Mail, Menu, Pause, Play, RotateCcw, X } from 'lucide-react';

type ComputeMode = 'prefill' | 'decode' | 'sparse';

const modes: Record<ComputeMode, { label: string; caption: string; accent: string; stat: string }> = {
  prefill: { label: 'Prefill', caption: 'Load context into the machine', accent: '#f5c96a', stat: '12.4 GB/s' },
  decode: { label: 'Decode', caption: 'One token, one measured step', accent: '#72c6ba', stat: '8.7 ms/token' },
  sparse: { label: 'Sparse route', caption: 'Only wake what the query needs', accent: '#bd9be3', stat: '42% active' },
};

function ComputeCanvas({ mode, paused, resetSignal }: { mode: ComputeMode; paused: boolean; resetSignal: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number | undefined>(undefined);
  const timeRef = useRef(0);
  const modeRef = useRef(mode);
  const pauseRef = useRef(paused);
  const resetRef = useRef(resetSignal);
  modeRef.current = mode;
  pauseRef.current = paused;

  useEffect(() => {
    if (resetRef.current !== resetSignal) {
      timeRef.current = 0;
      resetRef.current = resetSignal;
    }
  }, [resetSignal]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = canvas.clientWidth * ratio;
      canvas.height = canvas.clientHeight * ratio;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);

    const nodes = [
      { x: .14, y: .48, r: 4, name: 'input' },
      { x: .29, y: .27, r: 5, name: 'embed' },
      { x: .29, y: .69, r: 5, name: 'cache' },
      { x: .48, y: .46, r: 11, name: 'core' },
      { x: .69, y: .27, r: 5, name: 'route' },
      { x: .69, y: .69, r: 5, name: 'memory' },
      { x: .86, y: .48, r: 4, name: 'output' },
    ];
    const edges = [[0, 1], [0, 2], [1, 3], [2, 3], [3, 4], [3, 5], [4, 6], [5, 6]];
    const particles = Array.from({ length: 18 }, (_, i) => ({ edge: i % edges.length, offset: (i * .21) % 1, speed: .12 + (i % 4) * .018 }));

    const draw = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (!pauseRef.current) timeRef.current += .012;
      const t = timeRef.current;
      ctx.clearRect(0, 0, w, h);
      const current = modes[modeRef.current];
      const accent = current.accent;

      ctx.save();
      ctx.strokeStyle = 'rgba(143, 163, 170, .075)';
      ctx.lineWidth = 1;
      for (let x = 26; x < w; x += 42) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
      for (let y = 22; y < h; y += 42) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
      ctx.restore();

      const point = (n: { x: number; y: number }) => ({ x: n.x * w, y: n.y * h });
      edges.forEach(([a, b], edgeIndex) => {
        const pa = point(nodes[a]); const pb = point(nodes[b]);
        ctx.beginPath(); ctx.moveTo(pa.x, pa.y); ctx.lineTo(pb.x, pb.y);
        ctx.strokeStyle = edgeIndex === 2 || edgeIndex === 5 ? `${accent}55` : 'rgba(137, 162, 170, .3)';
        ctx.lineWidth = edgeIndex === 2 || edgeIndex === 5 ? 1.4 : 1;
        ctx.stroke();
      });

      particles.forEach((particle) => {
        const [a, b] = edges[particle.edge];
        const pa = point(nodes[a]); const pb = point(nodes[b]);
        const progress = (particle.offset + t * particle.speed) % 1;
        const x = pa.x + (pb.x - pa.x) * progress;
        const y = pa.y + (pb.y - pa.y) * progress;
        ctx.beginPath(); ctx.arc(x, y, particle.edge === 2 || particle.edge === 5 ? 2.4 : 1.7, 0, Math.PI * 2);
        ctx.fillStyle = particle.edge % 3 === 0 ? accent : '#87b8b4';
        ctx.shadowColor = ctx.fillStyle; ctx.shadowBlur = 10; ctx.fill(); ctx.shadowBlur = 0;
      });

      nodes.forEach((node, i) => {
        const p = point(node);
        const drift = i === 3 ? Math.sin(t * .8) * 3 : Math.sin(t * .45 + i) * 1.8;
        if (i === 3) {
          ctx.beginPath(); ctx.arc(p.x, p.y, 28 + drift, 0, Math.PI * 2);
          ctx.strokeStyle = `${accent}22`; ctx.lineWidth = 1; ctx.stroke();
          ctx.beginPath(); ctx.arc(p.x, p.y, 17 + drift, 0, Math.PI * 2);
          ctx.fillStyle = `${accent}14`; ctx.fill();
        }
        ctx.beginPath(); ctx.arc(p.x, p.y + drift, node.r, 0, Math.PI * 2);
        ctx.fillStyle = i === 3 ? accent : '#aac1c1'; ctx.fill();
        ctx.strokeStyle = i === 3 ? '#f8e6ae' : 'rgba(200, 219, 212, .5)'; ctx.lineWidth = 1.2; ctx.stroke();
      });

      ctx.font = '10px DM Mono, monospace';
      ctx.fillStyle = 'rgba(198, 211, 207, .5)';
      ctx.fillText('EMBED', w * .24, h * .2);
      ctx.fillText('KV CACHE', w * .235, h * .84);
      ctx.fillStyle = accent;
      ctx.fillText('ATTENTION / ACTIVE', w * .42, h * .28);
      ctx.fillStyle = 'rgba(198, 211, 207, .5)';
      ctx.fillText('WEIGHTS', w * .66, h * .2);
      ctx.fillText('MEMORY', w * .66, h * .84);
      frameRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => { if (frameRef.current) cancelAnimationFrame(frameRef.current); observer.disconnect(); };
  }, []);

  return <canvas ref={canvasRef} className="h-full w-full" aria-label={`${modes[mode].label} compute system visualization`} data-testid="canvas-compute-preview" />;
}

function App() {
  const [mode, setMode] = useState<ComputeMode>('prefill');
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
      <header className="fixed left-0 right-0 top-0 z-20 border-b hairline bg-[#0d141c]/85 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-[1280px] items-center justify-between px-5 sm:px-8 lg:px-12">
          <button onClick={() => navigate('top')} className="flex items-center gap-3 text-left" data-testid="button-brand-top">
            <span className="relative flex h-8 w-8 items-center justify-center border border-[#f5c96a]/70 text-[#f5c96a]">
              <span className="h-2 w-2 bg-[#f5c96a]" />
              <span className="absolute -right-1 -top-1 h-2 w-2 border border-[#72c6ba] bg-[#0d141c]" />
            </span>
            <span className="font-display text-[13px] font-semibold tracking-[.08em] text-[#f0ede3]">GOTTFRIED<br /><span className="text-[10px] font-normal tracking-[.2em] text-[#9ba9ad]">COMPUTING LAB</span></span>
          </button>
          <nav className="hidden items-center gap-8 md:flex" aria-label="Main navigation">
            {['focus', 'work', 'principles', 'contact'].map((item) => (
              <button key={item} onClick={() => navigate(item)} className="nav-link font-code text-[11px] uppercase tracking-[.12em]" data-testid={`link-nav-${item}`}>{item}</button>
            ))}
          </nav>
          <div className="hidden items-center gap-4 sm:flex">
            <span className="font-code text-[10px] text-[#809197]">STATUS <span className="ml-1 text-[#72c6ba]">● ONLINE</span></span>
            <button onClick={() => navigate('contact')} className="outline-button border hairline px-4 py-2 font-code text-[10px] uppercase tracking-[.1em] text-[#deded4]" data-testid="button-nav-connect">Connect <ArrowUpRight size={13} className="ml-2 inline" /></button>
          </div>
          <button className="text-[#deded4] sm:hidden" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu" data-testid="button-mobile-menu">{mobileOpen ? <X /> : <Menu />}</button>
        </div>
        {mobileOpen && <div className="border-t hairline bg-[#101b24] px-5 py-5 sm:hidden">
          <div className="flex flex-col gap-5">{['focus', 'work', 'principles', 'contact'].map((item) => <button key={item} onClick={() => navigate(item)} className="text-left font-code text-[11px] uppercase tracking-[.14em] text-[#bec7c5]" data-testid={`link-mobile-${item}`}>{item}</button>)}</div>
        </div>}
      </header>

      <section id="top" className="mx-auto grid min-h-[760px] max-w-[1280px] items-center gap-10 px-5 pb-20 pt-32 sm:px-8 lg:grid-cols-[.94fr_1.06fr] lg:gap-4 lg:px-12 lg:pt-36">
        <div className="relative z-10 max-w-[600px]">
          <div className="reveal mb-7 flex items-center gap-3 font-code text-[10px] uppercase tracking-[.18em] text-[#72c6ba]"><span className="inline-block h-1.5 w-1.5 rounded-full bg-[#72c6ba]" /> Independent research lab / 2025</div>
          <h1 className="reveal reveal-delay-1 font-display text-[clamp(3.6rem,8vw,7.8rem)] font-medium leading-[.88] tracking-[-.07em] text-[#f2f0e7]">Make<br /><span className="text-[#f5c96a]">intelligence</span><br />efficient.</h1>
          <p className="reveal reveal-delay-2 mt-8 max-w-[470px] text-[15px] leading-7 text-[#aeb9b9] sm:text-[17px]">Gottfried Computing Lab works at the boundary of algorithms and machines — helping capable AI run with less memory, less latency, and less waste.</p>
          <div className="reveal reveal-delay-3 mt-9 flex flex-wrap items-center gap-5">
            <button onClick={() => navigate('work')} className="gold-button bg-[#f5c96a] px-5 py-3 font-code text-[11px] font-medium uppercase tracking-[.1em] text-[#182128]" data-testid="button-hero-work">Explore the work <ArrowDown size={14} className="ml-3 inline" /></button>
            <button onClick={() => navigate('focus')} className="nav-link font-code text-[11px] uppercase tracking-[.1em]" data-testid="button-hero-focus">How we think <ArrowUpRight size={14} className="ml-2 inline" /></button>
          </div>
        </div>
        <div className="reveal reveal-delay-2 relative mt-10 aspect-[1.13/1] min-h-[370px] w-full max-w-[700px] justify-self-end lg:mt-0">
          <div className="absolute inset-0 border hairline bg-[#101a22]/60">
            <div className="absolute left-4 top-4 font-code text-[9px] uppercase tracking-[.17em] text-[#7f9095]">Live compute preview / 01</div>
            <div className="absolute right-4 top-4 flex items-center gap-2 font-code text-[9px] text-[#72c6ba]"><span className="h-1.5 w-1.5 rounded-full bg-[#72c6ba]" /> running</div>
            <ComputeCanvas mode={mode} paused={paused} resetSignal={resetSignal} />
            <div className="absolute bottom-4 left-4 font-code text-[9px] text-[#74868c]">TOKENS / {mode === 'decode' ? '001' : '048'} <span className="mx-2 text-[#3e5058]">|</span> TEMP / .20</div>
            <div className="absolute bottom-4 right-4 font-code text-[9px] text-[#f5c96a]">{modes[mode].stat}</div>
          </div>
          <div className="absolute -bottom-6 left-4 right-4 flex flex-col gap-3 border border-[#d8b461]/20 bg-[#16232b]/95 p-3 backdrop-blur-md sm:left-10 sm:right-10 sm:flex-row sm:items-center sm:justify-between">
            <div><div className="font-code text-[9px] uppercase tracking-[.14em] text-[#f5c96a]">System mode</div><div className="mt-1 text-xs text-[#b4bfbc]">{modes[mode].caption}</div></div>
            <div className="flex items-center gap-1">
              {(Object.keys(modes) as ComputeMode[]).map((key) => <button key={key} onClick={() => setMode(key)} className={`px-2 py-1 font-code text-[9px] uppercase tracking-[.08em] ${mode === key ? 'bg-[#f5c96a] text-[#172129]' : 'text-[#92a4a5] hover:text-[#f5c96a]'}`} data-testid={`button-mode-${key}`}>{modes[key].label}</button>)}
              <button onClick={() => setPaused(!paused)} className="ml-2 border-l border-[#d8e0dc]/15 pl-3 text-[#aebfbd] hover:text-[#f5c96a]" aria-label={paused ? 'Resume animation' : 'Pause animation'} data-testid="button-toggle-animation">{paused ? <Play size={14} /> : <Pause size={14} />}</button>
              <button onClick={() => setResetSignal((value) => value + 1)} className="ml-2 text-[#aebfbd] hover:text-[#f5c96a]" aria-label="Reset preview" data-testid="button-reset-preview"><RotateCcw size={13} /></button>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-12"><div className="axis-rule h-px w-full" /></div>

      <section id="focus" className="mx-auto max-w-[1280px] px-5 py-32 sm:px-8 lg:px-12 lg:py-40">
        <div className="grid gap-12 lg:grid-cols-[.65fr_1fr] lg:gap-24">
          <div><div className="font-code text-[10px] uppercase tracking-[.18em] text-[#f5c96a]">01 / Point of view</div><h2 className="mt-6 max-w-[450px] font-display text-4xl leading-[1.05] tracking-[-.045em] text-[#edeade] sm:text-5xl">Capability is only half the problem.</h2></div>
          <div className="max-w-[610px]"><p className="text-xl leading-8 text-[#c1c9c6] sm:text-2xl sm:leading-9">The other half is whether it can fit inside the world that needs it.</p><p className="mt-7 text-[15px] leading-7 text-[#8f9da0]">We build the missing layer between a good idea and a useful system. That means rethinking memory movement, adapting models to real hardware, and making efficiency a first-class property — not a postscript.</p><div className="mt-10 grid grid-cols-2 gap-x-8 gap-y-7 border-t hairline pt-7 sm:grid-cols-3"><div><div className="font-code text-[10px] text-[#f5c96a]">01</div><p className="mt-2 text-sm leading-5 text-[#a9b5b5]">Measure the whole path, not just the kernel.</p></div><div><div className="font-code text-[10px] text-[#72c6ba]">02</div><p className="mt-2 text-sm leading-5 text-[#a9b5b5]">Spend compute where it changes the answer.</p></div><div><div className="font-code text-[10px] text-[#bd9be3]">03</div><p className="mt-2 text-sm leading-5 text-[#a9b5b5]">Leave a smaller machine behind.</p></div></div></div>
        </div>
        <div className="mt-28 grid gap-px border hairline bg-[#2a3a42] md:grid-cols-3">
          {[['Efficient inference', 'Making models smaller, faster, and more responsive without making them less useful.', 'Quantization · KV cache · Speculative decoding'], ['Machine-aware systems', 'Treating memory, bandwidth, and topology as part of the model design.', 'Kernels · Scheduling · Co-design'], ['Open research', 'Publishing the measurements and tools that let the field move with us.', 'Benchmarks · Tooling · Reproducibility']].map(([title, copy, tags], index) => <article key={title} className="bg-[#111d25] p-7 sm:p-9"><div className={`font-code text-[10px] ${index === 0 ? 'text-[#f5c96a]' : index === 1 ? 'text-[#72c6ba]' : 'text-[#bd9be3]'}`}>0{index + 1}</div><h3 className="mt-16 font-display text-2xl tracking-[-.03em] text-[#eae8de]">{title}</h3><p className="mt-4 text-sm leading-6 text-[#92a0a3]">{copy}</p><div className="mt-8 border-t hairline pt-4 font-code text-[9px] uppercase tracking-[.1em] text-[#677a81]">{tags}</div></article>)}
        </div>
      </section>

      <section id="work" className="border-y hairline bg-[#101a21]">
        <div className="mx-auto max-w-[1280px] px-5 py-32 sm:px-8 lg:px-12 lg:py-40">
          <div className="flex flex-col justify-between gap-7 sm:flex-row sm:items-end"><div><div className="font-code text-[10px] uppercase tracking-[.18em] text-[#f5c96a]">02 / Selected signals</div><h2 className="mt-5 font-display text-4xl tracking-[-.05em] text-[#edeade] sm:text-5xl">Research in motion.</h2></div><span className="max-w-[260px] font-code text-[10px] leading-5 text-[#718188]">A few directions we are actively pushing forward — and making legible.</span></div>
          <div className="mt-14 grid gap-4 lg:grid-cols-[1.14fr_.86fr]">
            <article className="work-card group border hairline bg-[#14222a] p-7 sm:p-10"><div className="flex items-start justify-between"><span className="font-code text-[10px] text-[#72c6ba]">GCL / 001 — SYSTEMS NOTE</span><ArrowUpRight size={18} className="text-[#6d8485] transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" /></div><h3 className="mt-20 max-w-[570px] font-display text-3xl leading-tight tracking-[-.04em] text-[#eeeade] sm:text-4xl">The cost of a token is mostly where you choose to move it.</h3><p className="mt-6 max-w-[550px] text-sm leading-6 text-[#9eacab]">A field guide to memory movement in long-context inference, from bandwidth ceilings to the small architectural decisions that compound at scale.</p><div className="mt-10 flex flex-wrap gap-2"><span className="border border-[#72c6ba]/25 px-2 py-1 font-code text-[9px] text-[#72c6ba]">MEMORY SYSTEMS</span><span className="border hairline px-2 py-1 font-code text-[9px] text-[#85979a]">LONG CONTEXT</span></div></article>
            <div className="grid gap-4">
              {[['GCL / 002', 'A benchmark that follows the request', 'Latency · Energy · Quality', '#f5c96a'], ['GCL / 003', 'Routing sparsity without the mystery', 'Mixture of experts · Serving', '#bd9be3']].map(([id, title, tags, color]) => <article key={id} className="work-card group border hairline bg-[#14222a] p-7"><div className="flex justify-between font-code text-[10px]" style={{ color }}><span>{id}</span><ArrowUpRight size={16} className="text-[#6d8485] transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" /></div><h3 className="mt-12 max-w-[330px] font-display text-2xl leading-tight tracking-[-.035em] text-[#e8e6dc]">{title}</h3><p className="mt-6 font-code text-[10px] uppercase tracking-[.1em] text-[#75878b]">{tags}</p></article>)}
            </div>
          </div>
          <button onClick={() => window.open('https://github.com', '_blank', 'noopener,noreferrer')} className="outline-button mt-8 border hairline px-5 py-3 font-code text-[10px] uppercase tracking-[.1em] text-[#aeb9b7]" data-testid="button-github"><Github size={14} className="mr-2 inline" /> Browse open work <ArrowUpRight size={13} className="ml-2 inline" /></button>
        </div>
      </section>

      <section id="principles" className="mx-auto max-w-[1280px] px-5 py-32 sm:px-8 lg:px-12 lg:py-40">
        <div className="grid gap-14 lg:grid-cols-[.75fr_1.25fr] lg:gap-24"><div><div className="font-code text-[10px] uppercase tracking-[.18em] text-[#f5c96a]">03 / Working principles</div><h2 className="mt-5 font-display text-4xl leading-tight tracking-[-.05em] text-[#edeade] sm:text-5xl">Small team.<br />Long horizon.</h2></div><div className="grid gap-0 border-t hairline"><div className="grid gap-4 border-b hairline py-7 sm:grid-cols-[100px_1fr]"><span className="font-code text-[10px] text-[#f5c96a]">01 — RIGOR</span><p className="max-w-[520px] text-sm leading-6 text-[#abb6b5]">We keep a tight loop between a hypothesis, a measurement, and a machine. If the result cannot survive contact with hardware, it is not done.</p></div><div className="grid gap-4 border-b hairline py-7 sm:grid-cols-[100px_1fr]"><span className="font-code text-[10px] text-[#72c6ba]">02 — LEVERAGE</span><p className="max-w-[520px] text-sm leading-6 text-[#abb6b5]">The best optimization changes the shape of the problem. We look for the 10% insight that makes the next 10x possible.</p></div><div className="grid gap-4 border-b hairline py-7 sm:grid-cols-[100px_1fr]"><span className="font-code text-[10px] text-[#bd9be3]">03 — CANDOR</span><p className="max-w-[520px] text-sm leading-6 text-[#abb6b5]">No vanity metrics. We publish the trade-offs, the failure modes, and the conditions under which our work stops working.</p></div></div></div>
        <div className="mt-20 grid border hairline md:grid-cols-3"><div className="border-b hairline p-7 md:border-b-0 md:border-r"><div className="font-code text-4xl text-[#f5c96a]">8.7<span className="text-xl">ms</span></div><div className="mt-3 font-code text-[9px] uppercase tracking-[.12em] text-[#77898d]">decode step / target</div></div><div className="border-b hairline p-7 md:border-b-0 md:border-r"><div className="font-code text-4xl text-[#72c6ba]">42<span className="text-xl">%</span></div><div className="mt-3 font-code text-[9px] uppercase tracking-[.12em] text-[#77898d]">active experts / sparse route</div></div><div className="p-7"><div className="font-code text-4xl text-[#bd9be3]">1.4<span className="text-xl">×</span></div><div className="mt-3 font-code text-[9px] uppercase tracking-[.12em] text-[#77898d]">quality retained / compressed</div></div></div>
      </section>

      <section id="contact" className="border-t hairline bg-[#111d25]">
        <div className="mx-auto grid max-w-[1280px] gap-16 px-5 py-32 sm:px-8 lg:grid-cols-[1fr_.8fr] lg:gap-28 lg:px-12 lg:py-40">
          <div><div className="font-code text-[10px] uppercase tracking-[.18em] text-[#f5c96a]">04 / Open channel</div><h2 className="mt-5 max-w-[620px] font-display text-5xl leading-[.98] tracking-[-.06em] text-[#eeeade] sm:text-7xl">Bring us a hard problem.</h2><p className="mt-8 max-w-[490px] text-[15px] leading-7 text-[#9eacab]">We are interested in the questions that sit between a paper and a production system. Tell us what the machine is doing, what it should be doing, and where it gets expensive.</p><a href="mailto:hello@gottfried.ai" className="mt-9 inline-flex items-center font-code text-sm text-[#f5c96a] hover:text-[#ffe096]" data-testid="link-email"><Mail size={16} className="mr-3" /> hello@gottfried.ai <ArrowUpRight size={14} className="ml-2" /></a></div>
          <form onSubmit={submit} className="border hairline bg-[#14232b] p-6 sm:p-8">{sent ? <div className="flex min-h-[280px] flex-col justify-center"><div className="flex h-9 w-9 items-center justify-center bg-[#72c6ba] text-[#14232b]"><Check size={18} /></div><h3 className="mt-6 font-display text-2xl text-[#eeeade]">Message queued.</h3><p className="mt-3 text-sm leading-6 text-[#93a2a2]">We will read it carefully and get back to you at the address you shared.</p><button type="button" onClick={() => setSent(false)} className="mt-8 self-start font-code text-[10px] uppercase tracking-[.1em] text-[#f5c96a]" data-testid="button-send-another">Send another <ArrowUpRight size={12} className="ml-1 inline" /></button></div> : <><div className="mb-8 font-code text-[10px] uppercase tracking-[.15em] text-[#7f9295]">Start a conversation</div><label className="block font-code text-[10px] uppercase tracking-[.1em] text-[#93a4a5]">Your email<input required type="email" placeholder="you@company.com" className="mt-3 w-full border-b border-[#526268] bg-transparent px-0 py-3 text-sm text-[#e8e6dc] outline-none placeholder:text-[#526268] focus:border-[#f5c96a]" data-testid="input-email" /></label><label className="mt-8 block font-code text-[10px] uppercase tracking-[.1em] text-[#93a4a5]">The problem<textarea required placeholder="What are you working on?" rows={3} className="mt-3 w-full resize-none border-b border-[#526268] bg-transparent px-0 py-3 text-sm leading-6 text-[#e8e6dc] outline-none placeholder:text-[#526268] focus:border-[#f5c96a]" data-testid="input-message" /></label><button type="submit" className="gold-button mt-9 bg-[#f5c96a] px-5 py-3 font-code text-[10px] uppercase tracking-[.1em] text-[#182128]" data-testid="button-submit-contact">Transmit note <ArrowUpRight size={13} className="ml-2 inline" /></button></>}</form>
        </div>
      </section>

      <footer className="mx-auto flex max-w-[1280px] flex-col gap-6 px-5 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12"><div className="font-code text-[10px] uppercase tracking-[.12em] text-[#6f8185]">Gottfried Computing Lab <span className="mx-2 text-[#35464d]">/</span> Built for useful intelligence</div><div className="flex gap-6 font-code text-[10px] uppercase tracking-[.12em] text-[#6f8185]"><button onClick={() => navigate('top')} className="hover:text-[#f5c96a]" data-testid="button-back-top">Back to top ↑</button><span>© 2025 GCL</span></div></footer>
    </main>
  );
}

export default App;