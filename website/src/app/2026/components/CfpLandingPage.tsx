import Link from 'next/link';
import {
  contentByLocale,
  editProposalUrl,
  localeMetadata,
  sponsorshipUrl,
  submitProposalUrl,
  type Locale,
  type PageCopy,
  supportedLocales,
} from '../content';
import ScrollIndicator from './ScrollIndicator';

type Props = {
  locale: Locale;
};

type DateItem = PageCopy['keyDates']['items'][number];
type ProposalType = PageCopy['proposals']['types'][number];

const pagePadding = 'px-5 sm:px-8 lg:px-14 xl:px-16';
const contentWidth = 'mx-auto max-w-7xl';

const toneClasses = {
  yellow: 'bg-[#ffd343]',
  white: 'bg-white',
  lilac: 'bg-[#c7b8ff]',
  sky: 'bg-[#bfe8ff]',
};

const programNoteClasses = [
  'bg-[#ffd343]',
  'bg-[#c7b8ff]',
  'bg-white',
  'bg-[#ffced5]',
];

const dateCardClasses = [
  'bg-white -rotate-1',
  'bg-[#bfe8ff] rotate-1',
  'bg-[#f7e9c5] -rotate-[0.5deg]',
];

const navButtonBase =
  'inline-flex min-h-11 min-w-0 items-center justify-center rounded-full border-2 border-[#172033] px-2 py-2 text-center font-mono text-[0.8125rem] leading-tight font-black whitespace-nowrap text-[#172033] transition hover:-translate-y-0.5 sm:px-4 sm:text-sm';

const compactHeaderLabels: Record<
  Locale,
  { proposal: string; sponsor: string }
> = {
  en: { proposal: 'Proposal', sponsor: 'Sponsor' },
  'zh-hk': { proposal: '提案', sponsor: '贊助' },
  'zh-hant': { proposal: '提案', sponsor: '贊助' },
  'zh-hans': { proposal: '提案', sponsor: '赞助' },
  ko: { proposal: '제안', sponsor: '후원' },
  ja: { proposal: '提案', sponsor: 'スポンサー' },
};

const localeHref = (item: Locale) =>
  item === 'en' ? '/2026/en' : `/2026/${item}`;

function DoodleButton({
  children,
  href,
  variant = 'primary',
}: {
  children: React.ReactNode;
  href: string;
  variant?: 'primary' | 'secondary';
}) {
  const isPrimary = variant === 'primary';
  const opensNewTab = !href.startsWith('mailto:');

  return (
    <a
      href={href}
      target={opensNewTab ? '_blank' : undefined}
      rel={opensNewTab ? 'noreferrer' : undefined}
      className={`inline-flex min-h-12 w-full items-center justify-center rounded-xl border-2 border-[#172033] px-5 py-3 font-mono text-sm font-black text-[#172033] shadow-[4px_5px_0_#17203322] transition hover:-translate-y-0.5 hover:shadow-[6px_7px_0_#17203326] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#2b5b84] sm:w-auto md:text-base ${
        isPrimary
          ? '-rotate-1 bg-[#ffd343]'
          : 'rotate-1 bg-white [border-style:dashed]'
      }`}
    >
      {children}
    </a>
  );
}

function DoodleLine({
  className,
  color = '#172033',
}: {
  className?: string;
  color?: string;
}) {
  return (
    <svg
      aria-hidden='true'
      viewBox='0 0 260 56'
      className={className}
      fill='none'
    >
      <path
        d='M4 31C43 8 68 47 108 24C151 -1 182 45 256 18'
        stroke={color}
        strokeWidth='5'
        strokeLinecap='round'
      />
    </svg>
  );
}

function LocaleLinks({ locale }: { locale: Locale }) {
  return (
    <div className='hidden items-center gap-1 rounded-full border-2 border-[#172033] bg-[#bfe8ff] px-3 py-2 font-mono text-xs font-black lg:flex'>
      {supportedLocales.map(item => (
        <Link
          key={item}
          href={localeHref(item)}
          aria-current={item === locale ? 'page' : undefined}
          className={`rounded-full px-2 py-1 transition hover:bg-white/60 ${
            item === locale ? 'bg-white' : ''
          }`}
        >
          {localeMetadata[item].shortLabel}
        </Link>
      ))}
    </div>
  );
}

function LocaleMenu({ copy, locale }: { copy: PageCopy; locale: Locale }) {
  return (
    <details className='relative z-[60] shrink-0 lg:hidden'>
      <summary className='relative z-[70] cursor-pointer list-none rounded-full border-2 border-[#172033] bg-[#bfe8ff] px-3 py-2 font-mono text-sm font-black whitespace-nowrap [&::-webkit-details-marker]:hidden'>
        {copy.localeMeta.shortLabel} +
      </summary>
      <div className='absolute left-0 z-[80] mt-2 grid w-44 gap-1 rounded-2xl border-2 border-[#172033] bg-white p-2 font-mono text-sm font-black shadow-[5px_6px_0_#17203322]'>
        {supportedLocales.map(item => (
          <Link
            key={item}
            href={localeHref(item)}
            aria-current={item === locale ? 'page' : undefined}
            className={`rounded-xl px-3 py-2 transition hover:bg-[#bfe8ff] ${
              item === locale ? 'bg-[#bfe8ff]' : ''
            }`}
          >
            {localeMetadata[item].shortLabel}
          </Link>
        ))}
      </div>
    </details>
  );
}

function HeaderNav({ copy, locale }: { copy: PageCopy; locale: Locale }) {
  const compactLabels = compactHeaderLabels[locale];

  return (
    <div
      className={`sticky top-0 z-[90] ${pagePadding} pt-3 pb-2 sm:pt-4 sm:pb-3`}
    >
      <nav
        className={`${contentWidth} flex flex-col gap-4 overflow-visible rounded-[1.75rem] border-2 border-[#172033] bg-white/90 p-4 shadow-[6px_8px_0_#17203314] backdrop-blur sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8`}
      >
        <div className='min-w-0 space-y-1 lg:max-w-[25rem] xl:max-w-[32rem]'>
          <p className='break-words font-mono text-base font-black text-[#2b5b84] sm:text-lg xl:text-xl'>
            {copy.nav.brand}
          </p>
          <p className='hidden break-words text-base leading-tight font-semibold text-[#586174] sm:block sm:text-lg lg:text-base xl:text-lg'>
            {copy.nav.tagline}
          </p>
        </div>

        <div className='grid w-full grid-cols-[auto_minmax(0,1fr)_minmax(0,1fr)] items-center gap-2 lg:flex lg:w-auto lg:shrink-0 lg:justify-end lg:gap-3'>
          <LocaleLinks locale={locale} />
          <LocaleMenu copy={copy} locale={locale} />
          <a
            href={submitProposalUrl}
            target='_blank'
            rel='noreferrer'
            aria-label={copy.cta.submit}
            className={`${navButtonBase} bg-[#ffd343]`}
          >
            <span className='sm:hidden'>{compactLabels.proposal}</span>
            <span className='hidden sm:inline'>{copy.cta.submit}</span>
          </a>
          <a
            href={sponsorshipUrl}
            aria-label={copy.cta.sponsorship}
            className={`${navButtonBase} bg-white`}
          >
            <span className='sm:hidden'>{compactLabels.sponsor}</span>
            <span className='hidden sm:inline'>{copy.cta.sponsorship}</span>
          </a>
        </div>
      </nav>
    </div>
  );
}

function HeroHeadline({ headline }: { headline: string }) {
  return (
    <h1 className='flex w-full max-w-5xl min-w-0 flex-col items-center justify-center gap-1 text-center font-sans text-[clamp(2rem,7vw,4.6rem)] leading-[0.95] font-black tracking-normal text-[#172033] sm:gap-2 md:text-[4rem] xl:text-[3.2rem] xl:leading-[1.08]'>
      {headline.split('\n').map((line, index) => (
        <span
          key={`${index}-${line}`}
          className='block max-w-full whitespace-nowrap'
        >
          {line}
        </span>
      ))}
    </h1>
  );
}

function ProgramWall({ copy }: { copy: PageCopy }) {
  return (
    <div className='relative mx-auto w-full max-w-3xl rounded-[1.75rem] border-[3px] border-[#172033] bg-white p-6 shadow-[10px_12px_0_#17203322] md:p-8 xl:max-w-none xl:p-10'>
      <div className='flex items-center justify-between'>
        <span className='h-5 w-5 rounded-full border-2 border-[#172033] bg-[#d82236]' />
        <span className='h-5 w-5 rounded-full border-2 border-[#172033] bg-[#ffd343]' />
      </div>

      <h2 className='mt-8 max-w-3xl break-words text-[clamp(2rem,5.5vw,3.25rem)] leading-[1.05] font-black text-[#2b5b84] xl:mt-10 xl:text-4xl'>
        {copy.programWall.title}
      </h2>

      <div className='mt-8 grid gap-4 sm:grid-cols-2'>
        {copy.decorativeFragments.map((fragment, index) => (
          <div
            key={fragment}
            className={`min-h-24 rounded-2xl border-2 border-[#172033] px-5 py-4 shadow-[4px_5px_0_#17203318] ${
              programNoteClasses[index]
            } ${index % 2 === 0 ? '-rotate-1' : 'rotate-1'}`}
          >
            <p className='font-mono text-xs font-black text-[#2b5b84]'>
              0{index + 1}
            </p>
            <p className='mt-3 break-words text-lg leading-snug font-black'>
              {fragment}
            </p>
          </div>
        ))}
      </div>

      <div className='mt-8 rounded-2xl border-2 border-[#172033] bg-[#f7e9c5] px-5 py-5 text-base leading-7 font-semibold text-[#172033] sm:px-6'>
        {copy.programWall.caption}
      </div>
    </div>
  );
}

function KeyDateCard({ item, index }: { item: DateItem; index: number }) {
  return (
    <article
      className={`min-h-48 rounded-2xl border-[3px] border-[#172033] p-6 shadow-sm lg:min-h-64 xl:p-7 ${dateCardClasses[index]}`}
    >
      <p
        className={`font-mono text-sm font-black uppercase ${
          index === 0
            ? 'text-[#d82236]'
            : index === 1
              ? 'text-[#2b5b84]'
              : 'text-[#00a887]'
        }`}
      >
        {item.label}
      </p>
      <p className='mt-5 whitespace-pre-line break-words font-mono text-[clamp(1.6rem,4.4vw,2rem)] leading-tight font-black lg:text-[clamp(1.8rem,2.45vw,2.25rem)] xl:mt-6 xl:text-[2.35rem]'>
        {item.value}
      </p>
      {item.status && (
        <p className='mt-3 break-words font-mono text-base leading-tight font-black text-[#586174] xl:text-lg'>
          {item.status}
        </p>
      )}
      <p
        className={`text-base leading-7 font-semibold text-[#586174] xl:text-lg ${
          item.status ? 'mt-4' : 'mt-6 xl:mt-7'
        }`}
      >
        {item.note}
      </p>
    </article>
  );
}

function ProposalCard({
  proposal,
  tilt,
}: {
  proposal: ProposalType;
  tilt: string;
}) {
  const indexColor =
    proposal.tone === 'white'
      ? 'text-[#2b5b84]'
      : proposal.tone === 'sky'
        ? 'text-[#2b5b84]'
        : 'text-[#d82236]';

  return (
    <article
      className={`min-h-48 rounded-2xl border-[3px] border-[#172033] p-6 md:p-7 ${toneClasses[proposal.tone]} ${tilt}`}
    >
      <p className={`font-mono text-3xl font-black ${indexColor}`}>
        {proposal.index}
      </p>
      <h3 className='mt-5 break-words font-mono text-2xl leading-tight font-black'>
        {proposal.title}
      </h3>
      <p className='mt-4 break-words text-sm leading-6 text-[#172033] md:text-base'>
        {proposal.description}
      </p>
    </article>
  );
}

export default function CfpLandingPage({ locale }: Props) {
  const copy = contentByLocale[locale];

  return (
    <main
      lang={copy.localeMeta.htmlLang}
      className='min-h-screen overflow-x-clip bg-[#fff8e8] text-[#172033]'
    >
      <HeaderNav copy={copy} locale={locale} />

      <section
        className={`relative ${pagePadding} pt-4 pb-10 md:pt-6 md:pb-14 min-[1292px]:min-h-[calc(100svh-8rem)] min-[1292px]:pb-20`}
      >
        <DoodleLine
          color='#2b5b8433'
          className='absolute top-40 left-8 hidden h-16 w-56 md:block'
        />
        <DoodleLine
          color='#d8223630'
          className='absolute top-[35rem] right-12 hidden h-14 w-52 md:block'
        />
        <span className='absolute top-32 right-[12%] hidden h-3 w-3 rounded-full bg-[#d8223640] lg:block' />

        <div
          className={`${contentWidth} grid gap-10 pt-9 md:gap-12 md:pt-12 xl:grid-cols-[minmax(0,1.05fr)_minmax(20rem,0.95fr)] xl:items-center xl:gap-14 xl:pt-16`}
        >
          <div className='relative mx-auto w-full max-w-[46rem] min-w-0 xl:max-w-none'>
            <div className='absolute -top-1 -left-2 z-10 inline-flex max-w-[calc(100%-3rem)] items-center gap-2 rounded-full border-2 border-[#172033] bg-white px-4 py-2 font-mono text-sm leading-none font-black whitespace-nowrap sm:-left-3 lg:-left-4'>
              <span className='h-3 w-3 rounded-full border border-[#172033] bg-[#00a887]' />
              {copy.hero.badge}
            </div>

            <div className='relative mx-auto flex min-h-[clamp(12rem,31vw,19rem)] w-full max-w-[46rem] min-w-0 items-center justify-center rounded-[38%_45%_34%_42%/24%_30%_36%_32%] border-[3px] border-[#172033] bg-[#ffd343e6] px-4 py-8 sm:px-8 md:px-10 xl:max-w-none'>
              <HeroHeadline headline={copy.hero.headline} />
            </div>

            <div className='mx-auto mt-8 max-w-3xl space-y-5 text-center xl:mx-0 xl:text-left'>
              <p className='break-words text-2xl leading-tight font-black text-[#2b5b84] lg:text-3xl'>
                {copy.hero.subheadline}
              </p>
              <p className='mx-auto max-w-2xl break-words text-base leading-8 text-[#586174] md:text-lg xl:mx-0'>
                {copy.hero.body}
              </p>
              <div className='flex flex-col items-center gap-4 pt-4 sm:flex-row sm:flex-wrap sm:justify-center xl:justify-start'>
                <DoodleButton href={submitProposalUrl}>
                  {copy.cta.submit}
                </DoodleButton>
                <DoodleButton href={editProposalUrl} variant='secondary'>
                  {copy.cta.edit}
                </DoodleButton>
                <DoodleButton href={sponsorshipUrl} variant='secondary'>
                  {copy.cta.sponsorship}
                </DoodleButton>
              </div>
            </div>
          </div>

          <ProgramWall copy={copy} />
        </div>

        <ScrollIndicator label={copy.keyDates.title} targetId='key-dates' />
      </section>

      <section
        id='key-dates'
        className={`scroll-mt-12 ${pagePadding} pt-16 pb-12 md:pt-20 md:pb-16 xl:pt-28 xl:pb-20`}
      >
        <div className={contentWidth}>
          <div className='flex flex-col justify-between gap-4 md:flex-row md:items-end'>
            <h2 className='break-words font-mono text-[clamp(2rem,6vw,3.5rem)] leading-tight font-black md:text-5xl'>
              {copy.keyDates.title}
            </h2>
            <p className='text-base font-semibold text-[#586174] md:text-lg'>
              <code className='rounded-md border border-[#17203333] bg-white px-2 py-1 font-mono text-sm font-black text-[#2b5b84] md:text-base'>
                {copy.keyDates.timezone}
              </code>
            </p>
          </div>

          <div className='mt-8 grid gap-6 lg:grid-cols-3 lg:gap-7'>
            {copy.keyDates.items.map((item, index) => (
              <KeyDateCard key={item.label} item={item} index={index} />
            ))}
          </div>
        </div>
      </section>

      <section className={`relative ${pagePadding} py-16 sm:py-20`}>
        <div className='absolute inset-x-5 top-36 bottom-8 hidden rounded-[44%_48%_39%_42%/18%_19%_18%_20%] border-[3px] border-[#172033] md:block lg:inset-x-14' />
        <div className={`${contentWidth} relative`}>
          <div className='flex flex-col justify-between gap-4 md:flex-row md:items-start'>
            <h2 className='break-words font-mono text-[clamp(2.5rem,8vw,4.75rem)] leading-tight font-black md:text-5xl'>
              {copy.proposals.title}
            </h2>
            <p className='max-w-md break-words text-base leading-7 text-[#586174] md:text-lg'>
              {copy.proposals.intro}
            </p>
          </div>

          <div className='mt-12 grid gap-7 md:grid-cols-3 md:mt-16'>
            {copy.proposals.types.slice(0, 3).map((proposal, index) => (
              <ProposalCard
                key={proposal.index}
                proposal={proposal}
                tilt={index % 2 === 0 ? '-rotate-1' : 'rotate-1'}
              />
            ))}
          </div>

          <div className='mt-10 grid gap-7 md:mx-auto md:max-w-4xl md:grid-cols-2'>
            {copy.proposals.types.slice(3).map((proposal, index) => (
              <ProposalCard
                key={proposal.index}
                proposal={proposal}
                tilt={index === 0 ? 'rotate-1' : '-rotate-1'}
              />
            ))}
          </div>
        </div>
      </section>

      <section className={`${pagePadding} py-16 sm:py-20`}>
        <div
          className={`${contentWidth} grid gap-10 rounded-[1.75rem] border-[3px] border-[#172033] bg-[#f7e9c5] p-7 md:grid-cols-[0.75fr_1fr] md:p-12 lg:p-14`}
        >
          <div>
            <p className='font-mono text-base font-black text-[#2b5b84] uppercase'>
              {copy.guidance.kicker}
            </p>
            <h2 className='mt-7 break-words font-mono text-[clamp(2.25rem,7vw,4rem)] leading-tight font-black md:text-5xl'>
              {copy.guidance.title}
            </h2>
            <p className='mt-8 max-w-md break-words text-base leading-8 text-[#586174] md:text-lg'>
              {copy.guidance.body}
            </p>
          </div>

          <div className='grid gap-5 self-center'>
            {copy.guidance.items.map((item, index) => (
              <div
                key={item.mark}
                className={`flex gap-5 rounded-2xl border-2 border-[#172033] bg-white px-6 py-5 ${
                  index === 0 ? '-rotate-1' : index === 1 ? 'rotate-1' : ''
                }`}
              >
                <span
                  className={`font-mono text-3xl font-black ${
                    index === 0
                      ? 'text-[#00a887]'
                      : index === 1
                        ? 'text-[#2b5b84]'
                        : 'text-[#d82236]'
                  }`}
                >
                  {item.mark}
                </span>
                <p className='break-words text-base leading-7 md:text-lg'>
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={`${pagePadding} pt-12 pb-24`}>
        <div
          className={`${contentWidth} grid gap-10 rounded-[1.75rem] border-[4px] border-[#172033] bg-[#2b5b84] p-7 text-white md:grid-cols-[1fr_auto] md:items-center md:p-12`}
        >
          <div>
            <p className='break-words font-mono text-sm font-black text-[#ffd343] md:text-base'>
              {copy.finalCta.fragments}
            </p>
            <h2 className='mt-6 max-w-3xl break-words font-mono text-[clamp(2rem,6vw,3.75rem)] leading-tight font-black md:text-5xl'>
              {copy.finalCta.title}
            </h2>
            <p className='mt-5 max-w-3xl break-words text-base leading-8 text-[#dcebff] md:text-lg'>
              {copy.finalCta.body}
            </p>
          </div>
          <div className='flex flex-col gap-4 sm:flex-row md:flex-col'>
            <DoodleButton href={submitProposalUrl}>
              {copy.cta.submit}
            </DoodleButton>
            <DoodleButton href={editProposalUrl} variant='secondary'>
              {copy.cta.edit}
            </DoodleButton>
            <DoodleButton href={sponsorshipUrl} variant='secondary'>
              {copy.cta.sponsorship}
            </DoodleButton>
          </div>
        </div>
      </section>
    </main>
  );
}
