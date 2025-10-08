import { OstDocument } from 'outstatic';
import { load } from 'outstatic/server';
import Link from 'next/link';
import { OUTSTATIC_POST_COLLECTION } from '../../constants'; // Make sure this path is correct

// A helper function to format the date nicely
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export default async function LatestNews() {
  // Load the Outstatic database
  const db = await load();

  // Fetch the 3 most recent posts.
  // We only need the title, slug, and publishedAt fields.
  const posts = await db
    .find<OstDocument>({ collection: OUTSTATIC_POST_COLLECTION }, [
      'title',
      'slug',
      'publishedAt',
    ])
    .sort({ publishedAt: -1 }) // Sort by newest first
    .limit(5) // Get only the top 3
    .toArray();

  return (
    <>
      <div className='container mx-auto px-4 max-w-6xl'>
        <h2 className='text-center text-3xl sm:text-4xl md:text-5xl font-bold text-slate-600 mb-12 pb-2'>
          Latest News & Updates
        </h2>

        {posts.length > 0 ? (
          <ul className='space-y-4'>
            {posts.map(post => (
              <li key={post.slug} className='border-b border-gray-200 pb-4'>
                <Link href={`/news/${post.slug}`} className='group'>
                  <h3 className='text-base md:text-xl font-semibold text-gray-700 group-hover:text-blue-600 transition-colors'>
                    {post.title}
                  </h3>
                  {/* The <time> tag is semantically correct for dates */}
                  <div className='mt-4'>
                    <time
                      dateTime={post.publishedAt}
                      className='text-sm text-gray-500'
                    >
                      {formatDate(post.publishedAt)}
                    </time>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className='text-gray-500'>No recent news to display.</p>
        )}

        {/* Optional: Add a link to the main news page */}
        {posts.length > 0 && (
          <div className='mt-6 text-center'>
            <Link
              href='/news'
              className='font-semibold text-blue-600 hover:underline'
            >
              View all news →
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
