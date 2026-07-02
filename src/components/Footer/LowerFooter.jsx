'use client';

import Image from 'next/image';
import bg from '../../../public/Images/FooterIcons/FooterBg.png';
import Link from 'next/link';
import { Phone, Mail, MapPin, Archive } from 'lucide-react';

import { defaultImagePath } from '../../constants';

const contactItems = [
  {
    id: 'postal',
    title: 'کد پستی',
    content: '۵۵۵۵۵۵۵۵۵- ۵۵۵۵۵۵۵۵۵',
    type: 'postal',
  },
  {
    id: 'address',
    title: 'نشانی',
    content: 'تهران ، میدان سپاه ، خیابان حضرت ولی‌عصر ، سامانه فرم ساز',
    type: 'map',
  },
  {
    id: 'email',
    title: 'ایمیل',
    content: 'email@example.com',
    type: 'email',
  },
  {
    id: 'phone',
    title: 'شماره تماس',
    content: '۰۲۱-۱۲۳۴۵۶۷۸ ۰۲۱-۱۲۳۴۵۶۷۸',
    type: 'phone',
  },
];

const usefulLinks = [
  'ایران پیپر',
  'ایرانداک',
  'سامانه دانا(درگاه آشنایی با نخبگان و آینده سازان)',
  'پایگاه استنادی علوم جهان اسلام (isc)',
  'سامانه نان(سامانه نظام ایده ها و نیازها)',
  'سامانه ساتع( سامانه اجرایی تقاضا و عرضه)',
  'سامانه مپفا (مدیریت پژوهش و فناوری ایران)',
  'سامانه ساجد ( سامانه ارتباط جامعه و دانشگاه)',
  'سامانه پرتال نشریات علمی',
];

const easyAccessLinks = [
  'ریاست محترم دانشگاه',
  'معاونت آموزشی و پژوهشی',
  'پست الکترونیک دانشگاه',
  'معاونت پژوهش و فناوری',
  'فناوری اطلاعات و ارتباطات',
  'سامانه پاسخگویی به شکایات',
];

export default function LowerFooterComponent() {
  const getContactIcon = type => {
    const iconMap = {
      postal: Archive,
      map: MapPin,
      email: Mail,
      phone: Phone,
    };

    return iconMap[type] || Archive;
  };

  const getContactHref = item => {
    switch (item.type) {
      case 'phone':
        const phoneNumber = item.content.replace(/\D/g, '');
        return `tel:+98${phoneNumber.substring(1)}`;
      case 'email':
        return `mailto:${item.content}`;
      case 'map':
        return `https://maps.google.com/?q=${encodeURIComponent(item.content)}`;
      case 'postal':
        return 'https://post.ir/tracking';
      default:
        return '#';
    }
  };

  return (
    <div className="Footer-img relative z-0 w-full mx-auto text-white">
      <div className="absolute inset-0 w-full h-full">
        <Image
          src={bg || defaultImagePath}
          alt="University building"
          fill
          priority
          className="object-cover"
        />
      </div>
      <div className="absolute inset-0 bg-primary-950/95"></div>

      <div className="relative pb-16 z-20 grid grid-col-1 lg:grid-cols-3 px-3">
        <div className="useful-links mr-4 ml-4 mt-2">
          <div className="flex gap-2 pt-8 pb-7">
            <Image
              src="/Images/FooterIcons/FooterArrow.svg"
              alt="Arrow icon"
              width={20}
              height={20}
            />
            <h3 className="text-white pr-2 font-bold text-base">پیوند های مفید</h3>
          </div>
          <ul className="flex flex-col gap-7 list-disc mr-4">
            {usefulLinks.map((item, index) => (
              <li key={index}>
                <Link href="#" className="hover:text-orange-400 text-sm">
                  {item}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="easy-acess mr-4 ml-4 mt-2">
          <div className="flex gap-2 pt-8 pb-8">
            <Image
              src="/Images/FooterIcons/FooterArrow.svg"
              alt="Arrow icon"
              width={20}
              height={20}
            />
            <h3 className="text-white font-bold text-base pr-2">دسترسی آسان</h3>
          </div>
          <ul className="flex flex-col gap-7 list-disc mr-4">
            {easyAccessLinks.map((item, index) => (
              <li key={index}>
                <Link href="#" className="hover:text-orange-400 text-sm ">
                  {item}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact Us Section */}
        <div className="contact-us mr-4 ml-4 mt-2">
          <div className="flex gap-2 pt-8 pb-7">
            <Image
              src="/Images/FooterIcons/FooterArrow.svg"
              alt="Arrow icon"
              width={20}
              height={20}
            />
            <h3 className="text-white pr-2 font-bold text-base">ارتباط با ما</h3>
          </div>
          <div className="grid grid-cols-2 gap-x-16 gap-y-5">
            {contactItems.map(item => {
              const IconComponent = getContactIcon(item.type);
              return (
                <div key={item.id} className="space-y-2">
                  <div className="flex gap-2">
                    <IconComponent className="w-4 h-4 text-white" />
                    <span className="hover:text-orange-400 text-sm">{item.title}</span>
                  </div>
                  <a
                    href={getContactHref(item)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white hover:text-orange-400 text-sm"
                  >
                    {item.content}
                  </a>
                </div>
              );
            })}
          </div>

          {/* Map */}
          <div className="map flex justify-center pt-9 rounded-2xl pb-4 ">
            <div className="relative w-full h-[200px] z">
              <iframe
                src="https://www.openstreetmap.org/export/embed.html?bbox=51.4376,35.7077,51.4416,35.7097&layer=mapnik&marker=35.7087,51.4396"
                width="100%"
                height="100%"
                frameBorder="0"
                scrolling="no"
                marginHeight="0"
                marginWidth="0"
                title="University Location"
                className="rounded-2xl"
              />
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center absolute px-12 bottom-0 w-full z-30">
          <p className="p-3 m-auto border-solid border-t-1 border-gray-500">
            کلیه حقوق مادی و معنوی برای سامانه فرم ساز محفوظ می‌باشد.
          </p>
        </div>
      </div>
    </div>
  );
}
