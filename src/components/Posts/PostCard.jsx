import Image from 'next/image';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { defaultImagePath } from '@/constants/index';

export default function PostCard({ post }) {
  const hasText = !!(post.title || post.excerpt || post.publishedAt);
  const imageSrc = post.thumbnail || post.mainImage || defaultImagePath;

  return (
    <Link href={`/post/${post.id}`}>
      <Card className="overflow-hidden border transition-shadow hover:shadow-md cursor-pointer group py-0 h-full flex flex-col gap-2">
        <div className="relative aspect-4/3 bg-muted shrink-0">
          <Image
            src={imageSrc}
            alt={post.title || 'تصویر'}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        {hasText && (
          <div className="px-4 py-2 flex flex-col gap-2 min-h-14">
            {post.title && (
              <h3 className="text-base font-semibold line-clamp-2 leading-7 text-foreground group-hover:text-primary transition-colors">
                {post.title}
              </h3>
            )}
            {post.excerpt && (
              <p className="text-sm text-muted-foreground line-clamp-2 leading-6">{post.excerpt}</p>
            )}
            {post.updatedAt && (
              <span className="text-xs text-muted-foreground mt-auto pt-2">
                {new Date(post.updatedAt).toLocaleDateString('fa-IR')}
              </span>
            )}
          </div>
        )}
      </Card>
    </Link>
  );
}
