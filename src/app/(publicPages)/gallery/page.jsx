'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRightIcon, XIcon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import useVersionData from '../../../lib/hooks/useVersionData';
import PageSkeleton from '../../../components/Skeleton/PageSkeleton';

function ImageViewer({ images, startIndex, onClose }) {
  const [index, setIndex] = useState(startIndex);
  const total = images.length;

  const goPrev = () => setIndex((i) => (i - 1 + total) % total);
  const goNext = () => setIndex((i) => (i + 1) % total);

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex flex-col" onClick={onClose}>
      <div className="flex items-center justify-between px-4 py-3">
        <span className="text-xs text-white/60 tabular-nums">
          {index + 1} / {total}
        </span>
        <button
          type="button"
          onClick={onClose}
          className="size-8 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors"
        >
          <XIcon className="size-4" />
        </button>
      </div>

      <div
        className="flex-1 flex items-center justify-center px-4 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {total > 1 && (
          <button
            type="button"
            onClick={goPrev}
            className="absolute right-2 z-10 size-9 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            <ChevronRightIcon className="size-5" />
          </button>
        )}

        <img
          src={images[index]}
          alt={`تصویر ${index + 1}`}
          className="max-h-[80vh] max-w-full object-contain rounded-lg select-none"
          draggable={false}
        />

        {total > 1 && (
          <button
            type="button"
            onClick={goNext}
            className="absolute left-2 z-10 size-9 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            <ChevronLeftIcon className="size-5" />
          </button>
        )}
      </div>
    </div>
  );
}

export default function GalleryPage() {
  const router = useRouter();
  const { data, isLoading } = useVersionData();
  const [viewerIndex, setViewerIndex] = useState(null);

  if (isLoading) return <PageSkeleton />;

  const images = data?.images || [];

  return (
    <div className="p-4 space-y-4 pb-8">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="p-1 -mr-1 rounded-md text-grey-400 hover:text-grey-700 hover:bg-grey-50 transition-colors"
        >
          <ArrowRightIcon className="size-5" />
        </button>
        <h1 className="text-sm font-bold text-grey-800">گالری تصاویر</h1>
      </div>

      {images.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-sm text-grey-400">تصویری برای نمایش وجود ندارد.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {images.map((src, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setViewerIndex(i)}
              className="relative aspect-square rounded-xl overflow-hidden bg-grey-50 group"
            >
              <img
                src={src}
                alt={`تصویر ${i + 1}`}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
            </button>
          ))}
        </div>
      )}

      {viewerIndex !== null && (
        <ImageViewer
          images={images}
          startIndex={viewerIndex}
          onClose={() => setViewerIndex(null)}
        />
      )}
    </div>
  );
}
