'use client';

import { createContext, useContext, useState, useMemo, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import useMenus from '../hooks/useMenus';

const DEFAULT_DEPT_SLUG = 'boss-dept';

const MenuContext = createContext({
  allMenus: [],
  defaultMenus: [],
  deptMenus: [],
  isMenusLoading: true,
  pageDeptSlug: null,
  pageData: null,
  layoutStyle: 'standard',
  hasSpace: false,
  setPageInfo: () => {},
});

export function MenuProvider({ children }) {
  const { data: allMenus = [], isLoading } = useMenus();
  const [pageDeptSlug, setPageDeptSlug] = useState(null);
  const [pageData, setPageData] = useState(null);
  const pathname = usePathname();

  // Reset department when navigating to a new page
  useEffect(() => {
    setPageDeptSlug(null);
    setPageData(null);
  }, [pathname]);

  // Pages call this to inform the header about their department
  const setPageInfo = useCallback((deptSlug, data = null) => {
    setPageDeptSlug(deptSlug || null);
    setPageData(data || null);
  }, []);

  // Default menus = boss-dept (always shown in main nav)
  const defaultMenus = useMemo(
    () => allMenus.filter(m => m.departmentDetail?.slug === DEFAULT_DEPT_SLUG),
    [allMenus]
  );

  // Department-specific menus (shown in sub nav when page dept !== boss-dept)
  const deptMenus = useMemo(() => {
    if (!pageDeptSlug || pageDeptSlug === DEFAULT_DEPT_SLUG) return [];
    return allMenus.filter(m => m.departmentDetail?.slug === pageDeptSlug);
  }, [allMenus, pageDeptSlug]);

  // Derive layoutStyle from pageData (defaults to 'standard')
  const layoutStyle = pageData?.layoutStyle || 'standard';

  const hasSpace = pageData?.hasSpace || false;

  const value = useMemo(
    () => ({
      allMenus,
      defaultMenus,
      deptMenus,
      isMenusLoading: isLoading,
      pageDeptSlug,
      pageData,
      layoutStyle,
      hasSpace,
      setPageInfo,
    }),
    [
      allMenus,
      defaultMenus,
      deptMenus,
      isLoading,
      pageDeptSlug,
      pageData,
      layoutStyle,
      hasSpace,
      setPageInfo,
    ]
  );

  return <MenuContext.Provider value={value}>{children}</MenuContext.Provider>;
}

/**
 * Hook for pages to register their department with the menu system.
 * Call this in any page that fetches page data:
 *   useRegisterPageDepartment(data);
 */
export function useRegisterPageDepartment(data) {
  const { setPageInfo } = useContext(MenuContext);

  useEffect(() => {
    if (data?.department?.slug) {
      setPageInfo(data.department.slug, data);
    }
  }, [data?.department?.slug, setPageInfo, data]);
}

export function useMenuContext() {
  return useContext(MenuContext);
}
