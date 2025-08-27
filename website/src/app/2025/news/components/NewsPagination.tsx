'use client';

import Link from 'next/link';
import { useState } from 'react';
import { YEAR } from '../../constants';

type Post = {
  title: string;
  slug: string;
  publishedAt?: string;
  coverImage?: string;
  description?: string;
};

interface NewsPaginationProps {
  posts: Post[];
  postsPerPage: number;
}

export default function NewsPagination({
  posts,
  postsPerPage,
}: NewsPaginationProps) {
  const [currentPage, setCurrentPage] = useState(1);

  // Calculate pagination
  const totalPages = Math.ceil(posts.length / postsPerPage);
  const startIndex = (currentPage - 1) * postsPerPage;
  const endIndex = startIndex + postsPerPage;
  const currentPosts = posts.slice(startIndex, endIndex);

  // Handle page changes
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Update URL without navigation (optional)
    window.history.pushState(null, '', `/${YEAR}/news?page=${page}`);
  };

  return (
    <>
      <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
        {currentPosts.map(post => (
          <Link
            key={post.slug}
            href={`/${YEAR}/news/${post.slug}`}
            className='group'
          >
            <div className='bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all'>
              {post.coverImage && (
                <div className='h-48 overflow-hidden'>
                  <img
                    src={post.coverImage}
                    alt={post.title}
                    className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-300'
                  />
                </div>
              )}

              <div className='p-5'>
                <h2 className='font-bold text-base md:text-xl mb-2 group-hover:text-blue-600 transition-colors'>
                  {post.title}
                </h2>

                {post.publishedAt && (
                  <p className='text-xs md:text-sm text-gray-500 mb-3'>
                    {new Date(post.publishedAt).toLocaleDateString()}
                  </p>
                )}

                {post.description && (
                  <p className='text-gray-700 line-clamp-2'>
                    {post.description}
                  </p>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Client-side pagination */}
      <div className='mt-10 flex justify-center'>
        <div className='flex space-x-1'>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`px-4 py-2 rounded ${
                page === currentPage
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {page}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
