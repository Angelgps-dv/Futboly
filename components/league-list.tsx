import { useState, useEffect } from 'react';
import { CustomImage } from '@/components/custom/custom-image';
import {
  ColumnsProps,
  RowsProps,
  CustomTable,
} from '@/components/custom/custom-table';
import { LeaguesCollectionProps } from '@/firebase/db-types';
import { PageLoader } from '@/components/page-loader';
import { JoinPublicLeagueModal } from '@/components/modal/leagues-modal';
import { useGetLeagues } from '@/data/leagues/use-get-leagues';
import { QueryDocumentSnapshot } from 'firebase/firestore';

type LeaguesColumnKeysProps =
  | 'PRIVATE'
  | 'NAME'
  | 'WEEK'
  | 'PLAYERS'
  | 'ACTIONS';

const columns: ColumnsProps<LeaguesColumnKeysProps> = [
  { id: 'PRIVATE', label: ' ', minWidth: 50, align: 'center' },
  { id: 'NAME', label: 'Name', minWidth: 200 },
  { id: 'WEEK', label: 'Week', minWidth: 75 },
  { id: 'PLAYERS', label: 'Players', minWidth: 75 },
  { id: 'ACTIONS', label: ' ', minWidth: 75, align: 'center' },
];

const getRows = (leagues: Array<LeaguesCollectionProps>) => {
  return leagues.map((league: LeaguesCollectionProps) => {
    const players = league.players?.length || 0;
    return {
      PRIVATE: (
        <CustomImage
          imageKey={league.isPrivate ? 'PRIVATE' : 'PUBLIC'}
          width={20}
          height={20}
        />
      ),
      NAME: league.name,
      WEEK: 'Week 1',
      PLAYERS: players + ' / 10',
      ACTIONS: (
        <JoinPublicLeagueModal league={league as LeaguesCollectionProps} />
      ),
    };
  });
};

export const LeagueList = () => {
  const { getAllLeaguesByChunks } = useGetLeagues();
  const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot>();
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [rows, setRows] = useState<
    RowsProps<LeaguesColumnKeysProps> | never[]
  >();

  const leagueChunk = 15;

  useEffect(() => {
    (async () => {
      const data = await getAllLeaguesByChunks(undefined, leagueChunk);
      const leagues = data.leagues;
      if (data) setRows(getRows(leagues));
    })();
  }, []);

  useEffect(() => {
    (async () => {
      // There's still data to fetch
      if (lastVisible) {
        const data = await getAllLeaguesByChunks(lastVisible, leagueChunk);
        const leagues = data.leagues;
        if (data && leagues && rows) setRows([...rows, ...getRows(leagues)]);
      }
      // There's no more data to fetch
      else setHasMore(false);
    })();
  }, [lastVisible]);

  const onEndReached = async () => {
    const data = await getAllLeaguesByChunks(lastVisible, leagueChunk);
    const dataLastVisible = data.lastVisible;
    if (data && dataLastVisible) setLastVisible(dataLastVisible);
  };

  return (
    <div>
      {!rows && <PageLoader />}
      {rows && rows.length > 0 ? (
        <div className="mt-4 rounded-xl">
          <CustomTable
            columns={columns}
            rows={rows}
            elevation={1}
            className="deep-faded-shadow-around rounded-l min-h-[55vh]"
            onEndReached={onEndReached}
            isComplete={{ value: !hasMore, text: 'No more leagues' }}
          />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-4 mt-4">
          <p className="text-lg font-semibold text-gray-500 p-4">
            No leagues found
          </p>
        </div>
      )}
    </div>
  );
};
