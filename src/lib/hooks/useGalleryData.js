import usePageData from './usePageData';

const extractFirstItem = data => data?.results?.[0]?.data?.[0] || {};

export default function useGalleryData(slug) {
  const name = slug ? `gallery-${slug}` : 'gallery';
  return usePageData(name, {
    select: extractFirstItem,
  });
}
