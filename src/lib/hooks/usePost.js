import { useQuery } from '@tanstack/react-query';
import http from '../axios';

// ── Mock flag — set to false when the API is ready ──
const MOCK_ENABLED = false;

const MOCK_POST = {
  id: 'Post-3-A3EF9D1841FA3CED4AF6DFDB417C33FC',
  title: 'پست تست برای گالری پژوهش',
  slug: 'news-res',
  excerpt: 'پست تست برای گالری پژوهش',
  summary: '',
  content: '<p>&nbsp;پست تست برای گالری پژوهش&nbsp;</p>',
  mainImage: null,
  thumbnail:
    'https://back-product.itcuir.ir/media/uploads/2026/02/06/284c2a570123405f9e565248545d435d.JPG',
  postTypeId: 'PostType-3-F675DA6ADF',
  departmentId: '2bjn4O1p',
  categoryId: 'categoties-9-n7jP1xA0',
  status: 'PUBLISHED',
  statusDisplay: 'Published',
  lang: 'en',
  viewCount: 0,
  isPublished: false,
  publishedAt: '2026-02-06T04:26:00Z',
  isFeatured: false,
  isCommentable: true,
  priority: 150,
  gallery: [
    {
      type: 'image',
      url: 'https://back-dev.itcuir.ir/media/uploads/2026/02/06/9741ef8c00e84b51a3aec5ce1500c343.jpg',
      alt: 'test1',
    },
    {
      type: 'image',
      url: 'https://back-dev.itcuir.ir/media/uploads/2026/02/06/04dd0d2ed7aa416daaca33a6c0501ae7.JPG',
      alt: 'test2',
    },
    {
      type: 'image',
      url: 'https://back-dev.itcuir.ir/media/uploads/2026/02/06/987d437595954b5da2db59fe747cca60.JPG',
      alt: 'test3',
    },
    {
      type: 'video',
      url: 'https://back-dev.itcuir.ir/media/uploads/2026/02/06/f76691ffcf554c6a9712f9d246fabc29.mp4',
      poster:
        'https://back-dev.itcuir.ir/media/uploads/2026/02/06/987d437595954b5da2db59fe747cca60.JPG',
    },
  ],
  actions: [
    {
      label: 'دانلود فیلم ',
      url: 'https://www.nava-land.top/?s=&type=series&genre%5B%5D=0&sortby=popular&imdbrate=0&madeby%5B%5D=0&min_year=1800&max_year=2026&paged=1',
      style: 'primary',
      icon: 'fa-solid fa-link',
      target: '_self',
    },
    {
      label: 'دانلود فیلم ',
      url: 'https://www.nava-land.top/?s=&type=series&genre%5B%5D=0&sortby=popular&imdbrate=0&madeby%5B%5D=0&min_year=1800&max_year=2026&paged=1',
      style: 'outline',
      icon: 'fa-solid fa-video',
      target: '_self',
    },
    {
      label: 'دانلود فیلم ',
      url: 'https://www.nava-land.top/?s=&type=series&genre%5B%5D=0&sortby=popular&imdbrate=0&madeby%5B%5D=0&min_year=1800&max_year=2026&paged=1',
      style: 'primary',
      icon: 'fa-solid fa-play',
      target: '_blank',
    },
  ],
  attachments: [
    {
      title: 'فیلمک ',
      fileUrl:
        'https://back-dev.itcuir.ir/media/uploads/2026/02/06/5401e73b52894f1d8d86d35f4fc4c47d.mp4',
      fileSize: '2',
      fileType: 'mkv',
    },
  ],
  metaData: {},
  createdAt: '2026-02-06T01:00:59.336703Z',
  updatedAt: '2026-02-06T01:00:59.336794Z',
  authorId: 1,
  departmentDetail: {
    id: '2bjn4O1p',
    nameFa: 'معاونت پژوهش',
  },
  postTypeDetail: {
    id: 'PostType-3-F675DA6ADF',
    title: 'اخبار',
    description: '',
  },
  categoryDetail: {
    id: 'categoties-9-n7jP1xA0',
    title: 'اخبار-پژوهش',
    description: 'این اطلاعیه مربوط به معاونت پژوهش میباشد که به اخبار 2 لینک داده شده است',
  },
};

export default function usePost(slug, options = {}) {
  return useQuery({
    queryKey: ['post', slug],
    queryFn: ({ signal }) => {
      if (MOCK_ENABLED) return Promise.resolve(MOCK_POST);
      return http.get(`/public/post/${slug}`, { signal });
    },
    enabled: !!slug,
    ...options,
  });
}
