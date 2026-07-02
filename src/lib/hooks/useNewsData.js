import usePageData from './usePageData';

const extractFirstItem = data => data?.results?.[0]?.data?.[0] || {};

export default function useNewsData() {
  return usePageData('Notifications', {
    select: extractFirstItem,
  });
}
