'use client';

import { OverviewBanner } from '@/components/overview-banner';
import HomePageLayout from './layout';
import { AppTabs } from '@/components/app-tabs';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
// import { useGetUsers } from '@/data/users/use-get-users';
import { useEffect, useState } from 'react';
import { useGetLeagues } from '@/data/leagues/use-get-leagues';
import { PageLoader } from '@/components/page-loader';
import { NoLeagues } from '@/components/no-leagues';
import { UsersCollectionProps } from '@/firebase/db-types';
import { useAppSelector } from '@/store/hooks';

export default () => {
  // const { getUser } = useGetUsers();
  const user: UsersCollectionProps = useAppSelector((state) => state.user);
  const { hasLeagues } = useGetLeagues();
  const [loading, setLoading] = useState(true);
  const [hasUserLeagues, setHasUserLeagues] = useState(false);

  const uid = user?.id;
  useEffect(() => {
    (async () => {
      if (uid) {
        const hasUserLeagues = await hasLeagues(uid);
        setHasUserLeagues(hasUserLeagues);
        setLoading(false);
      }
    })();
  }, [uid]);

  return loading ? (
    <PageLoader />
  ) : (
    <div className="mx-6 md:mx-12 max-w-[1500px] w-full">
      {hasUserLeagues ? (
        <HomePageLayout>
          <div className="flex flex-col gap-10">
            <Header hideUsername />
            <OverviewBanner />
            <AppTabs />
            <Footer />
          </div>
        </HomePageLayout>
      ) : (
        <NoLeagues />
      )}
    </div>
  );
};
