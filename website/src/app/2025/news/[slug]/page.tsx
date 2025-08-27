import markdownToHtml from '@/utils/markdownToHtml';
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { OstDocument } from 'outstatic';
import { getDocumentSlugs, load } from 'outstatic/server';
import { FaArrowLeft } from 'react-icons/fa6';
import ogImage from '../../../../../public/2025/landing-pages/open-graph.webp';
import { OUTSTATIC_POST_COLLECTION, YEAR } from '../../constants';

type Post = {
  tags: { value: string; label: string }[];
} & OstDocument;

type Params = Promise<{ slug: string }>;

function absoluteUrl(path: string) {
  return `${process.env.NEXT_PUBLIC_SITE_URL}/${YEAR}/${path}`;
}

export async function generateMetadata(props: {
  params: Params;
}): Promise<Metadata> {
  const params = await props.params;
  const post = await getData(params);

  if (!post) {
    return {};
  }

  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      url: absoluteUrl(`/posts/${post.slug}`),
      images: [
        {
          url: absoluteUrl(post?.coverImage || ogImage.src),
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
      images: absoluteUrl(post?.coverImage || ogImage.src),
    },
  };
}

async function BackToNews() {
  return (
    <Link
      href={`/${YEAR}/news`}
      className='inline-flex items-center text-sm text-blue-600 hover:text-blue-800 mb-6 transition-colors'
    >
      <FaArrowLeft className='mr-2' />
      <span>Back to News</span>
    </Link>
  );
}

export default async function Post(props: { params: Params }) {
  const params = await props.params;
  const post = await getData(params);

  return (
    <main className='bg-gradient-to-b from-white to-gray-50'>
      {post?.coverImage && (
        <div className='relative w-full h-[40vh] md:h-[50vh] lg:h-[60vh]'>
          <Image
            alt={post.title}
            src={post.coverImage}
            fill
            className='object-cover object-center'
            priority
          />
          <div className='absolute inset-0 bg-white bg-opacity-30' />

          {/* Floating Tag Pills */}
          <div className='absolute bottom-6 left-0 w-full px-4 md:px-8'>
            <div className='max-w-5xl mx-auto'>
              {Array.isArray(post?.tags) && post.tags.length > 0 ? (
                <div className='flex flex-wrap gap-2 mb-4'>
                  {post.tags.map(({ label }, index) => (
                    <span
                      key={`${label}-${index}`}
                      className='inline-block bg-white bg-opacity-90 backdrop-blur-sm rounded-full px-4 py-1 text-sm font-medium text-gray-800 shadow-sm transition-transform hover:scale-105'
                    >
                      {label}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
      {/* Hero Section with Cover Image */}

      {/* Content Section */}
      <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10 pb-6'>
        {/* Article Card */}
        <article className='bg-white rounded-xl shadow-xl overflow-hidden'>
          {/* Article Header */}
          <div className='p-6 md:p-10'>
            <BackToNews />

            <h1 className='font-bold text-3xl md:text-4xl lg:text-5xl text-gray-800 leading-tight'>
              {post.title}
            </h1>

            {/* Date */}
            <div className='mt-6 flex items-center text-sm text-gray-500'>
              <time dateTime={post.publishedAt}>
                {new Date(post.publishedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </time>
            </div>

            {/* Description/Excerpt if available */}
            {post.description && (
              <div className='mt-6 text-lg text-gray-600 font-light italic border-l-4 border-gray-200 pl-4'>
                {post.description}
              </div>
            )}
          </div>

          <hr className='border-t border-gray-200' />

          {/* Article Content */}
          <div className='px-6 md:px-10 pb-10'>
            <div className='prose prose-lg prose-headings:text-gray-900 prose-a:no-underline prose-a:text-blue-600 prose-a:hover:text-blue-800 text-gray-700 prose-strong:text-gray-900 max-w-none'>
              <div dangerouslySetInnerHTML={{ __html: post.content }} />
            </div>

            {/* Article Footer */}
            <div className='mt-12 pt-6 border-t border-gray-200'>
              <div className='flex justify-start items-center'>
                <BackToNews />
              </div>
            </div>
          </div>
        </article>
      </div>
    </main>
  );
}

async function getData(params: { slug: string }) {
  const db = await load();

  const post = await db
    .find<Post>({ collection: OUTSTATIC_POST_COLLECTION, slug: params.slug }, [
      'title',
      'publishedAt',
      'description',
      'slug',
      'author',
      'content',
      'coverImage',
      'tags',
    ])
    .first();

  if (!post) {
    notFound();
  }

  const content = await markdownToHtml(post.content);

  return {
    ...post,
    content,
  };
}

export async function generateStaticParams() {
  const slugs = await getDocumentSlugs(OUTSTATIC_POST_COLLECTION);
  return slugs.map(slug => ({ slug }));
}
