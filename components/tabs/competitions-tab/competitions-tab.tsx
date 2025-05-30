import { useState, useEffect } from 'react';
import { IMG_URLS } from '@/utils/img-urls';
import { Chip, Card, CardContent, CardMedia } from '@mui/material';
import { CustomButton } from '../../custom/custom-button';
import { useGetCompetitions } from '@/data/competitions/use-get-competitions';
import { useSetCompetitions } from '@/data/competitions/use-set-competitions';
import { useAppSelector } from '@/store/hooks';
import { UsersCollectionProps } from '@/firebase/db-types';
import { EmptyMessage } from '../../empty-message';
import { TabSectionSpacer } from '../tab-section-spacer';

export const CompetitionsTab = () => {
  const user: UsersCollectionProps = useAppSelector((state) => state.user);
  const league = useAppSelector((state) => state.league);
  const activeCompetition = useAppSelector(
    (state) => state.competition.activeCompetition,
  );
  const { setActiveCompetition } = useSetCompetitions();
  const { getCompetitionsByUid } = useGetCompetitions();
  const [competitions, setCompetitions] = useState<any[]>();

  useEffect(() => {
    setTimeout(async () => {
      // I have to call it with a delay otherwise activeCompetition is still not set and all the "active" props are false
      await getAndSetUserCompetitions(
        league.id,
        user.id,
        getCompetitionsByUid,
        setCompetitions,
      );
    }, 750);
  }, [user, league, activeCompetition]);

  return (
    <TabSectionSpacer
      emptyMessage={{
        condition: !competitions?.length,
        Component: () => (
          <EmptyMessage
            title="There are no competitions created yet 🙁"
            description="Ask your admin to create a competition and select it to start!"
          />
        ),
      }}
      UniqueSection={() => (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 gap-y-6">
          {competitions?.map((competition, index) => {
            const { endDateText, players, name, id, active } = competition;
            return (
              <Card
                key={index + id}
                elevation={8}
                className={`max-w-[300px] rounded-xl ${
                  active ? '-order-1' : ''
                }`}
              >
                <CardMedia
                  className="h-40"
                  image={IMG_URLS.LOGIN_ILLUSTRATION.src}
                  title={IMG_URLS.LOGIN_ILLUSTRATION.alt}
                />
                <CardContent>
                  <div className="flex flex-col gap-2 items-center">
                    <div className="font-bold">{name}</div>
                    <div>End: {endDateText}</div>
                    {competition.competitionStarted && (
                      <div>
                        <Chip label="Started" color="primary" />
                      </div>
                    )}
                    <div>{players?.length} users</div>
                    <CustomButton
                      className="mt-2"
                      label={active ? 'Selected' : 'Select'}
                      disabled={active}
                      handleClick={() =>
                        setActiveCompetition(id, user, league.id, competition)
                      }
                    />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    />
  );
};

async function getAndSetUserCompetitions(
  leagueId: string,
  userId: string,
  getter: (leagueId: string, userId: string) => Promise<any[]>,
  setter: (comp: any[]) => void,
) {
  const userComps = await getter(leagueId, userId);
  setter(userComps);
}
