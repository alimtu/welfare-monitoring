'use client';

import { useRef, useState, useMemo } from 'react';
import { Controller } from 'react-hook-form';
import {
  UploadIcon, XIcon, ImageIcon, FileIcon, VideoIcon, MicIcon,
  FileTextIcon, FileSpreadsheetIcon, EyeIcon, LoaderIcon, WifiOffIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import { Label } from '../../ui/label';
import useUpload from '../../../lib/hooks/useUpload';
import { useOnlineStatus } from '../../../lib/hooks/usePWA';

const TYPE_CONFIG = {
  7:  { accept: 'image/*', label: 'انتخاب تصویر', icon: ImageIcon },
  8:  { accept: '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip,.rar', label: 'انتخاب فایل', icon: FileIcon },
  23: { accept: 'audio/*', label: 'انتخاب فایل صوتی', icon: MicIcon },
  24: { accept: 'video/*', label: 'انتخاب ویدیو', icon: VideoIcon },
};

function getFileIcon(file, type) {
  if (type === 7) return ImageIcon;
  if (type === 24) return VideoIcon;
  if (type === 23) return MicIcon;
  const ext = file?.name?.split('.').pop()?.toLowerCase();
  if (['pdf'].includes(ext)) return FileTextIcon;
  if (['xls', 'xlsx', 'csv'].includes(ext)) return FileSpreadsheetIcon;
  if (['doc', 'docx', 'txt'].includes(ext)) return FileTextIcon;
  return FileIcon;
}

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function FilePreview({ file, localUrl, type, onClose }) {
  if (!localUrl) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div className="relative max-w-full max-h-[85vh] bg-white rounded-xl overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={onClose}
          className="absolute top-2 left-2 z-10 size-8 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-colors"
        >
          <XIcon className="size-4" />
        </button>

        {type === 7 && (
          <img src={localUrl} alt={file?.name} className="max-h-[80vh] max-w-full object-contain" />
        )}

        {type === 24 && (
          <video src={localUrl} controls className="max-h-[80vh] max-w-full" />
        )}

        {type === 23 && (
          <div className="p-8 flex flex-col items-center gap-3">
            <MicIcon className="size-12 text-grey-300" />
            <p className="text-sm text-grey-700 text-center break-all">{file?.name}</p>
            <audio src={localUrl} controls className="w-full mt-2" />
          </div>
        )}

        {type === 8 && (
          <div className="p-8 flex flex-col items-center gap-3">
            <FileIcon className="size-12 text-grey-300" />
            <p className="text-sm text-grey-700 text-center break-all">{file?.name}</p>
            <p className="text-xs text-grey-400">{file?.size ? formatSize(file.size) : ''}</p>
            <p className="text-xs text-grey-400">پیش‌نمایش این نوع فایل پشتیبانی نمی‌شود.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function UploaderField({ name, control, section }) {
  const inputRef = useRef(null);
  const [previewing, setPreviewing] = useState(false);
  const [localFile, setLocalFile] = useState(null);
  const config = TYPE_CONFIG[section.type] || TYPE_CONFIG[8];
  const upload = useUpload();
  const isOnline = useOnlineStatus();

  return (
    <Controller
      name={name}
      control={control}
      defaultValue={null}
      render={({ field, fieldState }) => {
        const hasValue = !!field.value;
        const FileIconComp = localFile ? getFileIcon(localFile, section.type) : config.icon;

        const localUrl = useMemo(() => {
          if (localFile) return URL.createObjectURL(localFile);
          return null;
        }, [localFile]);

        const handleChange = (e) => {
          const selected = e.target.files?.[0];
          if (!selected) return;

          setLocalFile(selected);

          upload.mutate(selected, {
            onSuccess: (data) => {
              field.onChange(data?.file || data);
            },
            onError: () => {
              toast.error('خطا در آپلود فایل');
              setLocalFile(null);
              field.onChange(null);
              if (inputRef.current) inputRef.current.value = '';
            },
          });
        };

        const handleRemove = () => {
          field.onChange(null);
          setLocalFile(null);
          setPreviewing(false);
          upload.reset();
          if (inputRef.current) inputRef.current.value = '';
        };

        return (
          <div>
            <Label className="text-xs text-grey-500 font-normal">
              {section.title}
              {section.required && <span className="text-danger-500 mr-0.5">*</span>}
            </Label>
            {section.placeholder && (
              <p className="text-[11px] text-grey-300 mt-0.5">{section.placeholder}</p>
            )}

            <input
              ref={inputRef}
              type="file"
              accept={config.accept}
              onChange={handleChange}
              className="hidden"
            />

            {!localFile && !hasValue ? (
              !isOnline ? (
                <div className="mt-1.5 flex w-full flex-col items-center gap-2 rounded-lg border border-dashed border-grey-200 bg-grey-50 px-4 py-5 text-grey-400">
                  <WifiOffIcon className="size-5" />
                  <span className="text-xs text-center leading-relaxed">
                    برای بارگذاری فایل به اینترنت نیاز است.
                  </span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  disabled={upload.isPending}
                  className={`mt-1.5 flex w-full flex-col items-center gap-2 rounded-lg border border-dashed px-4 py-5 text-grey-400 transition-colors hover:border-primary-300 hover:text-primary-500 ${
                    fieldState.error ? 'border-danger-400' : 'border-grey-200'
                  }`}
                >
                  <UploadIcon className="size-5" />
                  <span className="text-sm">{config.label}</span>
                </button>
              )
            ) : (
              <div className="mt-1.5 rounded-lg border border-grey-100 overflow-hidden">
                {section.type === 7 && localUrl && (
                  <div
                    className="relative h-36 bg-grey-50 cursor-pointer group"
                    onClick={() => setPreviewing(true)}
                  >
                    <img src={localUrl} alt={localFile?.name} className="w-full h-full object-contain" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <EyeIcon className="size-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                )}

                {section.type === 24 && localUrl && (
                  <div
                    className="relative h-36 bg-black cursor-pointer group"
                    onClick={() => setPreviewing(true)}
                  >
                    <video src={localUrl} className="w-full h-full object-contain" muted />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="size-10 rounded-full bg-white/80 flex items-center justify-center group-hover:bg-white transition-colors">
                        <VideoIcon className="size-5 text-grey-700" />
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 px-3 py-2.5">
                  {upload.isPending ? (
                    <LoaderIcon className="size-5 text-primary-400 shrink-0 animate-spin" />
                  ) : (
                    <FileIconComp className="size-5 text-primary-400 shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-grey-700 truncate">{localFile?.name}</p>
                    <p className="text-[11px] text-grey-400">
                      {upload.isPending
                        ? 'در حال آپلود...'
                        : localFile ? formatSize(localFile.size) : ''}
                    </p>
                  </div>
                  {!upload.isPending && (
                    <>
                      <button
                        type="button"
                        onClick={() => setPreviewing(true)}
                        className="text-grey-400 hover:text-primary-500 p-1"
                      >
                        <EyeIcon className="size-4" />
                      </button>
                      <button
                        type="button"
                        onClick={handleRemove}
                        className="text-grey-400 hover:text-danger-500 p-1"
                      >
                        <XIcon className="size-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}

            {fieldState.error && (
              <p className="text-[11px] text-danger-500 mt-1">{fieldState.error.message}</p>
            )}

            {previewing && localFile && (
              <FilePreview file={localFile} localUrl={localUrl} type={section.type} onClose={() => setPreviewing(false)} />
            )}
          </div>
        );
      }}
    />
  );
}
