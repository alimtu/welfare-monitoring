import { useQuery, keepPreviousData } from '@tanstack/react-query';
import axios from 'axios';
import config from '../../config';

/**
 * Fetches paginated public posts.
 * Uses axios directly (not HttpService) to preserve the `meta` pagination object
 * that the response interceptor normally strips.
 *
 * All filter params are optional — at least one must be provided.
 *
 * @param {Object} params
 * @param {string} [params.departmentSlug]
 * @param {string} [params.postTypeSlug]
 * @param {string} [params.categoryId]
 * @param {number} [params.page=1]
 * @param {number} [params.pageSize=12]
 * @param {Object} [options] — extra react-query options
 *
 * @returns {{ data: { posts, meta }, isLoading, error, refetch, ... }}
 */
export default function usePublicPosts(
  { departmentSlug, postTypeSlug, categorySlug, page = 1, size = 12 } = {},
  options = {}
) {
  const hasFilter = !!(departmentSlug || postTypeSlug || categorySlug);

  return useQuery({
    queryKey: ['public-posts', departmentSlug, postTypeSlug, categorySlug, page, size],
    queryFn: async ({ signal }) => {
      const params = { page, size };
      if (departmentSlug) params.department_slug = departmentSlug;
      if (postTypeSlug) params.post_type_slug = postTypeSlug;
      if (categorySlug) params.category_id = categorySlug;

      const { data: body } = await axios.get(`${config.api.baseURL}/public/post`, {
        params,
        signal,
      });

      return {
        posts: body.data || [],
        meta: body.meta || {},
      };
    },
    enabled: hasFilter,
    placeholderData: keepPreviousData,
    ...options,
  });
}
