import { OstDocument } from 'outstatic';
import { load } from 'outstatic/server';
import { OUTSTATIC_POST_COLLECTION, POSTS_PER_PAGE } from '../constants';
import NewsPagination from './components/NewsPagination';

export default async function NewsPage() {
  const db = await load();
  const allPosts = await db
    .find<OstDocument>({ collection: OUTSTATIC_POST_COLLECTION }, [
      'title',
      'slug',
      'publishedAt',
      'coverImage',
      'description',
    ])
    .sort({ publishedAt: -1 })
    .toArray();

  return (
    <div className='container mx-auto px-4 py-8'>
      <h1 className='font-bold text-2xl md:text-3xl lg:text-4xl mb-8 text-gray-700 text-center'>
        News
      </h1>

      <NewsPagination posts={allPosts} postsPerPage={POSTS_PER_PAGE} />
    </div>
  );
}
