'use client';

import { app } from '@/firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useEffect } from 'react';
import { useSetUsers } from '@/data/users/use-set-users';
import { useSetLeague } from '@/data/leagues/use-set-league';
import { useGetLeagues } from '@/data/leagues/use-get-leagues';
import { useAppSelector } from '@/store/hooks';
import { UsersCollectionProps } from '@/firebase/db-types';
import { useSetCompetitions } from '@/data/competitions/use-set-competitions';

export default ({ children }: any) => {
  const auth = getAuth(app);
  const user: UsersCollectionProps = useAppSelector((state) => state.user);
  const { setUser } = useSetUsers();
  const { setLeague } = useSetLeague();
  const { setCompetitions } = useSetCompetitions();
  const { getActiveLeagueByUid } = useGetLeagues();

  // FETCH USER DATA
  onAuthStateChanged(auth, async (userPar) => {
    const uid = userPar?.uid;
    if (uid && uid !== user.id) await setUser(uid); //When it changes it will update the user so the useEffect will run
  });

  // FETCH LEAGUE DATA
  useEffect(() => {
    (async () => {
      const uid = user?.id;
      if (uid) {
        const league = await getActiveLeagueByUid(uid, user);
        if (league) {
          await setLeague(league, uid);
          await setCompetitions(league.id);
        }
      }
    })();
  }, [user]);

  return <>{children}</>;
};
