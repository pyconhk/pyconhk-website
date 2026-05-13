import Link from 'next/link';
import {
  contentByLocale,
  editProposalUrl,
  localeMetadata,
  submitProposalUrl,
  type Locale,
  supportedLocales,
} from '../content';

type Props = {
  locale: Locale;
};

const toneClasses = {
  yellow: 'bg-[#ffd343]',
  white: 'bg-white',
  lilac: 'bg-[#c7b8ff]',
  sky: 'bg-[#bfe8ff]',
};

const cardTilt = ['-rotate-1', 'rotate-1', '-rotate-[0.7deg]'];
const programNoteClasses = [
  'bg-[#ffd343]',
  'bg-[#c7b8ff]',
  'bg-white',
  'bg-[#ffced5]',
];

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

  return (
    <a
      href={href}
      target='_blank'
      rel='noreferrer'
      className={`inline-flex min-h-12 items-center justify-center rounded-xl border-2 border-[#172033] px-5 py-3 font-mono text-sm font-black text-[#172033] shadow-[4px_5px_0_#17203322] transition hover:-translate-y-0.5 hover:shadow-[6px_7px_0_#17203326] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#2b5b84] md:text-base ${
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

export default function CfpLandingPage({ locale }: Props) {
  const copy = contentByLocale[locale];

  return (
    <main
      lang={copy.localeMeta.htmlLang}
      className='min-h-screen overflow-hidden bg-[#fff8e8] text-[#172033]'
    >
      <section className='relative px-5 pt-5 pb-20 sm:px-8 lg:px-16'>
        <DoodleLine
          color='#2b5b8433'
          className='absolute top-40 left-8 hidden h-16 w-56 md:block'
        />
        <DoodleLine
          color='#d8223630'
          className='absolute top-[35rem] right-12 hidden h-14 w-52 md:block'
        />
        <span className='absolute top-32 right-[12%] hidden h-3 w-3 rounded-full bg-[#d8223640] lg:block' />

        <nav className='mx-auto flex max-w-7xl flex-col gap-4 rounded-[1.75rem] border-2 border-[#172033] bg-white/85 px-4 py-4 backdrop-blur sm:flex-row sm:items-center sm:justify-between sm:px-8'>
          <div className='min-w-0 sm:max-w-xl'>
            <p className='break-words font-mono text-base font-black text-[#2b5b84] sm:text-lg'>
              {copy.nav.brand}
            </p>
            <p className='break-words text-base leading-tight font-semibold text-[#586174] sm:text-lg'>
              {copy.nav.tagline}
            </p>
          </div>

          <div className='flex w-full shrink-0 items-center justify-between gap-3 sm:w-auto sm:justify-end'>
            <div className='hidden items-center gap-1 rounded-full border-2 border-[#172033] bg-[#bfe8ff] px-3 py-2 font-mono text-xs font-black sm:flex'>
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
            <details className='relative shrink-0 sm:hidden'>
              <summary className='cursor-pointer list-none rounded-full border-2 border-[#172033] bg-[#bfe8ff] px-4 py-2 font-mono text-sm font-black [&::-webkit-details-marker]:hidden'>
                {copy.localeMeta.shortLabel} +
              </summary>
              <div className='absolute right-0 z-30 mt-2 grid w-44 gap-1 rounded-2xl border-2 border-[#172033] bg-white p-2 font-mono text-sm font-black shadow-[5px_6px_0_#17203322]'>
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
            <a
              href={submitProposalUrl}
              target='_blank'
              rel='noreferrer'
              className='min-w-0 flex-1 rounded-full border-2 border-[#172033] bg-[#ffd343] px-3 py-2 text-center font-mono text-sm font-black text-[#172033] transition hover:-translate-y-0.5 sm:flex-none sm:px-5'
            >
              {copy.cta.submit}
            </a>
          </div>
        </nav>

        <div className='mx-auto grid max-w-7xl gap-16 pt-16 lg:grid-cols-[1.08fr_0.82fr] lg:items-start lg:gap-20 lg:pt-20'>
          <div className='relative'>
            <div className='absolute -top-8 left-0 z-10 inline-flex items-center gap-2 rounded-full border-2 border-[#172033] bg-white px-4 py-2 font-mono text-sm font-black'>
              <span className='h-3 w-3 rounded-full border border-[#172033] bg-[#00a887]' />
              {copy.hero.badge}
            </div>

            <div className='relative flex min-h-[17rem] items-center justify-center rounded-[38%_45%_34%_42%/24%_30%_36%_32%] border-[3px] border-[#172033] bg-[#ffd34399] px-6 py-12 sm:min-h-[20rem] sm:px-10 md:px-12'>
              <h1 className='max-w-4xl break-words text-center font-mono text-[2.65rem] leading-[1.08] font-black tracking-normal sm:text-6xl md:text-7xl lg:text-[4.6rem]'>
                {copy.hero.headline}
              </h1>
            </div>

            <div className='mt-8 max-w-3xl space-y-5 pl-1 sm:pl-5'>
              <p className='break-words text-2xl leading-tight font-black text-[#2b5b84] md:text-3xl'>
                {copy.hero.subheadline}
              </p>
              <p className='max-w-2xl break-words text-base leading-8 text-[#586174] md:text-lg'>
                {copy.hero.body}
              </p>
              <div className='flex flex-col gap-4 pt-4 sm:flex-row'>
                <DoodleButton href={submitProposalUrl}>
                  {copy.cta.submit}
                </DoodleButton>
                <DoodleButton href={editProposalUrl} variant='secondary'>
                  {copy.cta.edit}
                </DoodleButton>
              </div>
            </div>
          </div>

          <div className='relative rounded-[1.75rem] border-[3px] border-[#172033] bg-white p-7 shadow-[10px_12px_0_#17203322] md:p-10'>
            <div className='flex items-center justify-between'>
              <span className='h-5 w-5 rounded-full border-2 border-[#172033] bg-[#d82236]' />
              <span className='h-5 w-5 rounded-full border-2 border-[#172033] bg-[#ffd343]' />
            </div>

            <h2 className='mt-10 break-words font-mono text-3xl leading-tight font-black text-[#2b5b84] md:text-4xl'>
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

            <div className='mt-8 rounded-2xl border-2 border-[#172033] bg-[#f7e9c5] px-6 py-5 text-base leading-7 font-semibold text-[#172033]'>
              {copy.programWall.caption}
            </div>
          </div>
        </div>
      </section>

      <section className='px-5 py-16 sm:px-8 lg:px-16'>
        <div className='mx-auto max-w-7xl'>
          <div className='flex flex-col justify-between gap-4 md:flex-row md:items-end'>
            <h2 className='break-words font-mono text-3xl leading-tight font-black md:text-5xl'>
              {copy.keyDates.title}
            </h2>
            <p className='text-base font-semibold text-[#586174] md:text-lg'>
              <code className='rounded-md border border-[#17203333] bg-white px-2 py-1 font-mono text-sm font-black text-[#2b5b84] md:text-base'>
                {copy.keyDates.timezone}
              </code>
            </p>
          </div>

          <div className='mt-10 grid gap-7 md:grid-cols-3'>
            {copy.keyDates.items.map((item, index) => (
              <article
                key={item.label}
                className={`min-h-52 rounded-2xl border-[3px] border-[#172033] p-7 shadow-sm ${
                  index === 0
                    ? 'bg-white -rotate-1'
                    : index === 1
                      ? 'bg-[#bfe8ff] rotate-1'
                      : 'bg-[#f7e9c5] -rotate-[0.5deg]'
                }`}
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
                <p className='mt-6 whitespace-pre-line break-words font-mono text-2xl leading-tight font-black md:text-3xl'>
                  {item.value}
                </p>
                <p className='mt-7 text-lg font-semibold text-[#586174]'>
                  {item.note}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className='relative px-5 py-20 sm:px-8 lg:px-16'>
        <div className='absolute inset-x-5 top-36 bottom-8 hidden rounded-[44%_48%_39%_42%/18%_19%_18%_20%] border-[3px] border-[#172033] md:block lg:inset-x-14' />
        <div className='relative mx-auto max-w-7xl'>
          <div className='flex flex-col justify-between gap-4 md:flex-row md:items-start'>
            <h2 className='break-words font-mono text-3xl leading-tight font-black md:text-5xl'>
              {copy.proposals.title}
            </h2>
            <p className='max-w-md break-words text-base leading-7 text-[#586174] md:text-lg'>
              {copy.proposals.intro}
            </p>
          </div>

          <div className='mt-16 grid gap-7 md:grid-cols-3'>
            {copy.proposals.types.slice(0, 3).map((proposal, index) => (
              <article
                key={proposal.index}
                className={`min-h-44 rounded-2xl border-[3px] border-[#172033] p-7 ${toneClasses[proposal.tone]} ${cardTilt[index]}`}
              >
                <p
                  className={`font-mono text-3xl font-black ${
                    proposal.tone === 'white'
                      ? 'text-[#2b5b84]'
                      : proposal.tone === 'lilac'
                        ? 'text-[#d82236]'
                        : 'text-[#d82236]'
                  }`}
                >
                  {proposal.index}
                </p>
                <h3 className='mt-5 break-words font-mono text-2xl font-black'>
                  {proposal.title}
                </h3>
                <p className='mt-4 break-words text-sm leading-6 text-[#172033] md:text-base'>
                  {proposal.description}
                </p>
              </article>
            ))}
          </div>

          <div className='mt-10 grid gap-7 md:mx-auto md:max-w-4xl md:grid-cols-2'>
            {copy.proposals.types.slice(3).map((proposal, index) => (
              <article
                key={proposal.index}
                className={`min-h-44 rounded-2xl border-[3px] border-[#172033] p-7 ${toneClasses[proposal.tone]} ${
                  index === 0 ? 'rotate-1' : '-rotate-1'
                }`}
              >
                <p
                  className={`font-mono text-3xl font-black ${
                    proposal.tone === 'sky'
                      ? 'text-[#2b5b84]'
                      : 'text-[#00a887]'
                  }`}
                >
                  {proposal.index}
                </p>
                <h3 className='mt-5 break-words font-mono text-2xl font-black'>
                  {proposal.title}
                </h3>
                <p className='mt-4 break-words text-sm leading-6 text-[#172033] md:text-base'>
                  {proposal.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className='px-5 py-20 sm:px-8 lg:px-16'>
        <div className='mx-auto grid max-w-7xl gap-10 rounded-[1.75rem] border-[3px] border-[#172033] bg-[#f7e9c5] p-7 md:grid-cols-[0.75fr_1fr] md:p-12 lg:p-14'>
          <div>
            <p className='font-mono text-base font-black text-[#2b5b84] uppercase'>
              {copy.guidance.kicker}
            </p>
            <h2 className='mt-7 break-words font-mono text-3xl leading-tight font-black md:text-5xl'>
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

      <section className='px-5 pt-12 pb-24 sm:px-8 lg:px-16'>
        <div className='mx-auto grid max-w-7xl gap-10 rounded-[1.75rem] border-[4px] border-[#172033] bg-[#2b5b84] p-7 text-white md:grid-cols-[1fr_auto] md:items-center md:p-12'>
          <div>
            <p className='break-words font-mono text-sm font-black text-[#ffd343] md:text-base'>
              {copy.finalCta.fragments}
            </p>
            <h2 className='mt-6 max-w-3xl break-words font-mono text-3xl leading-tight font-black md:text-5xl'>
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
          </div>
        </div>
      </section>
    </main>
  );
}
