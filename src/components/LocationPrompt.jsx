'use client';

import { useState } from 'react';
import { MapPinIcon } from 'lucide-react';
import { Button } from './ui/button';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
} from './ui/drawer';

export default function LocationPrompt({ status, onAllow, onClose }) {
  const [loading, setLoading] = useState(false);

  const showDrawer = status === 'idle' || status === 'loading';

  const handleAllow = async () => {
    setLoading(true);
    await onAllow();
    setLoading(false);
  };

  const handleOpenChange = (open) => {
    if (!open) onClose?.();
  };

  return (
    <Drawer open={showDrawer} onOpenChange={handleOpenChange}>
      <DrawerContent>
        <DrawerHeader className="items-center pt-6">
          <div className="size-14 rounded-full bg-primary-50 flex items-center justify-center mb-2">
            <MapPinIcon className="size-6 text-primary-500" />
          </div>
          <DrawerTitle className="text-sm font-bold text-grey-800">
            دسترسی به موقعیت مکانی
          </DrawerTitle>
          <DrawerDescription className="text-xs text-grey-500 leading-relaxed max-w-xs text-center">
            برای ثبت موقعیت مکانی در فرم‌ها، نیاز به دسترسی به مکان شما داریم.
            بدون این دسترسی امکان استفاده از اپلیکیشن وجود ندارد.
          </DrawerDescription>
        </DrawerHeader>
        <DrawerFooter className="pb-6">
          <Button onClick={handleAllow} className="w-full h-11" disabled={loading}>
            {loading ? 'در حال دریافت موقعیت...' : 'اجازه می‌دهم'}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
