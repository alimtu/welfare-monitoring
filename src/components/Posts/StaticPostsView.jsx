'use client';

import { useState } from 'react';
import PostsPageSkeleton from '@/components/Skeleton/PostsPageSkeleton';
import MinimalError from '@/components/Error/MinimalError';
import usePublicPosts from '@/lib/hooks/usePublicPosts';
import PostCard from './PostCard';
import Pagination from './Pagination';
import PostsEmptyState from './PostsEmptyState';

export default function StaticPostsView({ pageData }) {
  const [page, setPage] = useState(1);

  const changePage = page => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setPage(page);
  };

  const departmentSlug = pageData.department?.slug || '';
  const postTypeSlug = pageData.postType?.slug || '';
  const categorySlug = pageData.categories?.slug || '';

  const { data, isLoading, error, refetch } = usePublicPosts({
    departmentSlug,
    postTypeSlug,
    categorySlug,
    page,
    size: 10,
  });

  if (isLoading) return <PostsPageSkeleton />;
  if (error) return <MinimalError onRetry={refetch} />;

  const posts = data?.posts || [];
  const meta = data?.meta || {};

  return (
    <div className="px-4 lg:px-20 py-8 flex flex-col gap-8">
      {/* Header */}

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl md:text-2xl font-semibold text-foreground">
            {pageData.title || 'پست‌ها'}
          </h1>
          {meta.totalRecords > 0 && (
            <span className="text-sm text-muted-foreground">{meta.totalRecords} مورد</span>
          )}
        </div>

        <div className="flex gap-2">
          <span>{pageData.postType?.title}</span>
          <span>{pageData.categories?.title}</span>
        </div>
      </div>

      {/* Grid or Empty */}
      {posts.length === 0 ? (
        <PostsEmptyState />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {posts.map(post => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {posts.length > 0 && (
        <div className="py-4">
          <Pagination meta={meta} currentPage={page} onPageChange={changePage} />
        </div>
      )}
    </div>
  );
}
