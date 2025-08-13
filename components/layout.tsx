'use client';

import Header from './header';

export const Layout = () => {
  //const pathname = usePathname();

  return (
    <div data-layout className='pt-0 bg-white dark:bg-zinc-950'>
      <Header />
    </div>
  );
};
