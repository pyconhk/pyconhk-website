import dateConverter from '@/utils/dateConverter';
import Link from 'next/link';
import { OstDocument } from 'outstatic';
import { load } from 'outstatic/server';
import { OUTSTATIC_POST_COLLECTION, POSTS_PER_PAGE } from '../constants';

export default async function NewsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  const pageNumber = parseInt(page || '1', 10);

  // Get all posts
  const { allPosts, totalPages } = await getPaginationData();

  const startIndex = (pageNumber - 1) * POSTS_PER_PAGE;
  const endIndex = startIndex + POSTS_PER_PAGE;
  const paginatedPosts = allPosts.slice(startIndex, endIndex);

  return (
    <div className='container mx-auto px-4 py-8'>
      <h1 className='font-bold text-2xl md:text-3xl lg:text-4xl mb-8 text-gray-700 text-center'>
        News
      </h1>

      {/* Post listing */}
      <div className='w-full mt-16'>
        {paginatedPosts.map(post => (
          <Link key={post.slug} href={`/2025/news/${post.slug}`}>
            <div className='flex justify-between items-center p-4 border border-gray-200 rounded-lg hover:shadow-lg transition-shadow duration-300 gap-2'>
              <span className='grow'>{post.title}</span>
              <span className='grow-0'>{dateConverter(post.publishedAt)}</span>
            </div>
          </Link>
        ))}
      </div>

      {/* Pagination */}
      <div className='mt-16 flex justify-center'>
        <div className='flex space-x-1'>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <Link
              key={page}
              href={`/2025/news?page=${page}`}
              className={`px-4 py-2 rounded ${
                page === pageNumber
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {page}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

async function getPaginationData() {
  const db = await load();
  const allPosts = await db
    .find<OstDocument>({ collection: OUTSTATIC_POST_COLLECTION }, [
      'title',
      'slug',
      'publishedAt',
    ])
    .sort('publishedAt')
    .toArray();

  const totalPages = Math.ceil(allPosts.length / POSTS_PER_PAGE);

  return {
    allPosts,
    totalPages,
  };
}
