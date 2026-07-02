import usePageData from './usePageData';

export default function useDepartmentPage(department, slug) {
  const name = department && slug ? `${department}-${slug}` : department || null;

  return usePageData(name);
}
