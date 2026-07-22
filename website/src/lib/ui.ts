export const appShell =
  'relative mx-auto flex min-h-screen w-full max-w-[1160px] flex-col gap-4 px-2 py-4 sm:px-4 sm:py-6';

export const appBackdrop =
  'pointer-events-none fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.18)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.14)_1px,transparent_1px)] bg-[length:2rem_2rem] [mask-image:linear-gradient(180deg,rgba(0,0,0,0.75),transparent_82%)]';

export const surfacePanel =
  'rounded-[32px] border border-ink/10 bg-white/70 shadow-[0_28px_70px_rgba(26,33,48,0.12)] backdrop-blur-xl';

export const sectionPanel = `${surfacePanel} p-6 sm:p-8 lg:p-10`;

export const insetPanel =
  'rounded-[24px] border border-ink/10 bg-white/60 p-5 shadow-[0_18px_40px_rgba(21,36,51,0.08)] backdrop-blur-md';

export const eyebrow =
  'font-sans text-[0.8rem] font-extrabold uppercase tracking-[0.18em] text-forest';

export const eyebrowOnDark =
  'font-sans text-[0.8rem] font-extrabold uppercase tracking-[0.18em] text-gold-strong';

export const sectionTitle =
  'text-3xl font-bold leading-tight text-slate-700 sm:text-4xl lg:text-5xl';

export const heroTitle =
  'text-5xl font-bold leading-tight text-white sm:text-6xl lg:text-7xl';

export const articleTitle =
  'text-4xl font-bold leading-tight text-slate-700 sm:text-5xl lg:text-6xl';

export const leadText =
  'mt-4 max-w-[62ch] text-base leading-7 text-muted sm:text-[1.05rem]';

export const leadTextOnDark =
  'mt-4 max-w-[62ch] text-base leading-7 text-white/90 sm:text-[1.05rem]';

export const supportingText = 'mt-4 text-sm leading-7 text-muted sm:text-base';

export const supportingTextOnDark = 'mt-4 text-sm leading-7 text-white/75 sm:text-base';

export const pillButton =
  'inline-flex items-center justify-center gap-2 rounded-full border border-ink/10 bg-white/60 px-4 py-3 text-sm font-bold text-ink transition duration-150 hover:-translate-y-0.5 hover:border-forest/30 hover:bg-white/85 hover:shadow-[0_16px_34px_rgba(15,106,73,0.08)]';

export const pillButtonActive = 'border-forest/40 bg-forest/10 text-forest';

export const primaryButton =
  'inline-flex items-center justify-center gap-2 rounded-full border border-gold/60 bg-gold px-5 py-3 text-sm font-bold text-forest-strong transition duration-150 hover:-translate-y-0.5 hover:bg-gold/90 hover:shadow-[0_16px_34px_rgba(241,214,79,0.2)]';

export const softButton =
  'inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/15 px-5 py-3 text-sm font-bold text-white transition duration-150 hover:-translate-y-0.5 hover:bg-white/25';

export const articleProse =
  '[&_a]:text-forest [&_a]:underline [&_a]:decoration-forest/40 [&_a]:underline-offset-4 [&_blockquote]:border-l-4 [&_blockquote]:border-forest/20 [&_blockquote]:pl-4 [&_blockquote]:italic [&_h2]:mt-10 [&_h2]:text-3xl [&_h2]:font-bold [&_h2]:leading-tight [&_h3]:mt-8 [&_h3]:text-2xl [&_h3]:font-bold [&_h3]:leading-tight [&_h4]:mt-6 [&_h4]:text-xl [&_h4]:font-semibold [&_img]:rounded-[24px] [&_li]:mb-3 [&_ol]:pl-5 [&_p]:mb-6 [&_p]:text-[1.02rem] [&_p]:leading-8 [&_strong]:font-bold [&_ul]:pl-5';
