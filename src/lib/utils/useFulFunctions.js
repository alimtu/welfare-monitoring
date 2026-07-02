export const handleClickOnItem = (link, router) => {
  if (!link || typeof link !== 'string') {
    console.error('Invalid link provided to handleClickOnItem');
    return;
  }

  const allowedExtensions = [
    '.pdf',
    '.doc',
    '.docx',
    '.xls',
    '.xlsx',
    '.ppt',
    '.pptx',
    '.png',
    '.jpg',
    '.jpeg',
    '.gif',
    '.svg',
    '.webp',
  ];

  if (allowedExtensions.some(extension => link.endsWith(extension))) {
    window.open(link, '_blank');
  } else {
    router.push(link);
  }
};
