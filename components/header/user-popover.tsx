import { useState, useEffect } from 'react';
import Popover from '@mui/material/Popover';
import { useBreakpoint } from '@/utils/use-breakpoint';
import { CustomModal } from '@/components/custom/custom-modal';
import { useAppSelector } from '@/store/hooks';
import { CustomCard } from '@/components/custom/custom-card';
import { CustomTable } from '@/components/custom/custom-table';
import { ColumnsProps, RowsProps } from '../custom/custom-table';
import { CustomButton } from '@/components/custom/custom-button';
import { CustomImage } from '../custom/custom-image';
import { CreateLeagueModal } from '@/components/modal/leagues-modal';
import { LeaguesModal } from '@/components/modal/leagues-modal';
import {
  LeaguesCollectionProps,
  UsersCollectionProps,
} from '@/firebase/db-types';
import { Loader } from '@/components/loader';
import { useGetLeagues } from '@/data/leagues/use-get-leagues';
import { useSetLeague } from '@/data/leagues/use-set-league';

type LeaguesColumnKeysProps =
  | 'ICON'
  | 'LEAGUE'
  | 'TEAM'
  | 'PLAYERS'
  | 'COMPETITIONS'
  | 'SELECT'
  | 'EXIT';

type UserPopoverProps = {
  id: string | undefined;
  open: boolean;
  anchorEl: HTMLButtonElement | null;
  functions: {
    handleClose: () => void;
  };
};

const columns: ColumnsProps<LeaguesColumnKeysProps> = [
  { id: 'ICON', label: ' ', minWidth: 25, align: 'center' },
  { id: 'LEAGUE', label: 'League', minWidth: 150 },
  { id: 'TEAM', label: 'Team', minWidth: 100, align: 'center' },
  { id: 'PLAYERS', label: 'Players', minWidth: 75, align: 'center' },
  { id: 'COMPETITIONS', label: 'Comps', minWidth: 75, align: 'center' },
  { id: 'SELECT', label: ' ', minWidth: 75, align: 'center' },
  { id: 'EXIT', label: ' ', minWidth: 75, align: 'center' },
];

const getRows = (
  leagues: Array<LeaguesCollectionProps>,
  setLeagues: any,
  user: UsersCollectionProps,
  deleteElement: (league: LeaguesCollectionProps, userId: string) => void,
) => {
  return leagues.map((league: LeaguesCollectionProps) => {
    return {
      ICON: (
        <CustomImage
          forceSrc="https://cdn.sportmonks.com/images/soccer/leagues/271.png"
          width={16}
          height={16}
        />
      ),
      LEAGUE: league.name,
      TEAM: 'Team',
      PLAYERS: Object.keys(league.players).length.toString() + ' / 10',
      COMPETITIONS: 10,
      SELECT: (
        <CustomButton
          style="outlineMain"
          label="Select"
          disableElevation
          className="rounded-full text-xs py-1 my-1 px-4 h-full"
          handleClick={() => setLeagues(league, user.id)}
        />
      ),
      EXIT: (
        <CustomButton
          style="outlineMain"
          label="Exit"
          disableElevation
          className="rounded-full text-xs py-1 my-1 px-2 h-full"
          handleClick={() => deleteElement(league, user.id)}
        />
      ),
    };
  });
};

type UserSectionProps = { handleClose: () => void; isModal?: boolean };

const UserSection = ({ handleClose, isModal }: UserSectionProps) => {
  const user = useAppSelector((state) => state.user);
  const league = useAppSelector((state) => state.league);
  const { getLeaguesByUid } = useGetLeagues();
  const { setLeague } = useSetLeague();
  const { exitLeague } = useSetLeague();
  const [check, setCheck] = useState(true);
  const [rows, setRows] = useState<RowsProps<LeaguesColumnKeysProps>>();

  const deleteElement = (league: LeaguesCollectionProps, userId: string) => {
    exitLeague(league.id, league, userId);
    setCheck(true);
  };

  useEffect(() => {
    (async () => {
      if (!check) return;
      const data = await getLeaguesByUid(user.id);
      if (data) {
        setRows(getRows(data, setLeague, user, deleteElement));
        setCheck(false);
      }
    })();
  }, [check]);

  return (
    <div className="px-0 sm:mx-2 md:px-4 mt-2 rounded-2xl md:max-w-[500px] md:w-[50vw]">
      {!isModal && (
        <div
          id="rulesTitle"
          className="p-2 flex flex-row items-center justify-between"
        >
          <div className="flex">
            Hello, <div className="ml-1 font-bold">{user.username}</div>
          </div>
          <div id="closeUserPopover">
            <button
              onClick={handleClose}
              type="button"
              className="relative rounded-full p-1 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2"
            >
              <span className="absolute -inset-1.5" />
              <span className="sr-only">Close User Popover</span>
              <CustomImage
                imageKey="CLOSE_ICON"
                className="h-4 w-4"
                width={16}
                height={16}
              />
            </button>
          </div>
        </div>
      )}
      <div
        id="actualLeague"
        className="my-6 flex flex-col gap-2 items-center justify-center"
      >
        <div className="flex flex-col items-center justfy-center gap-2">
          <CustomImage
            forceSrc="https://cdn.sportmonks.com/images/soccer/leagues/271.png"
            width={48}
            height={48}
          />
          <div className="flex flex-row gap-1">
            <p className="text-nowrap font-bold text-gray-800 text-sm">
              {league?.name}
            </p>
            <p className="text-nowrap font-semibold text-gray-600 text-sm">
              's league
            </p>
          </div>
        </div>
        <CustomCard style="gray" className="lg:px-6 w-full">
          <div className="flex flex-row items-center justify-between gap-16 mx-4">
            <div className="flex flex-col items-center justify-center mx-4">
              <CustomImage
                forceSrc="https://cdn.sportmonks.com/images/soccer/leagues/271.png"
                className="h-12 w-12"
                width={48}
                height={48}
              />
            </div>
            <div className="flex flex-col items-center justify-center mx-4">
              <CustomImage
                forceSrc="https://cdn.sportmonks.com/images/soccer/teams/30/62.png"
                className="h-12 w-12"
                width={48}
                height={48}
              />
              <p className="text-nowrap font-medium text-gray-500 text-sm">
                Team
              </p>
            </div>
          </div>
        </CustomCard>
      </div>
      <div id="userLeagueList" className="flex flex-col gap-2 h-full">
        <h4 className="text-pretty font-semibold text-lg mb-2">My Leagues</h4>
        <div className="min-h-[30vh]">
          {!rows && <Loader />}
          {rows && rows.length > 0 ? (
            <CustomTable<LeaguesColumnKeysProps>
              rows={rows}
              columns={columns as ColumnsProps<LeaguesColumnKeysProps>}
              elevation={0}
              className="flex flex-col min-h-[30vh] overflow-y main-scrollbar"
              customizeColumns={{ className: 'text-xs text-dark' }}
              customizeRows={{ className: 'text-sm text-dark' }}
            />
          ) : (
            <div className="flex flex-col items-center justify-center gap-4 mt-4">
              <p className="text-lg font-semibold text-gray-500">
                No leagues found
              </p>
            </div>
          )}
        </div>
      </div>
      <div
        id="leagueActions"
        className="mt-2 flex flex-row gap-2 py-2 justify-between items-center"
      >
        <CreateLeagueModal buttonFull />
        <LeaguesModal />
      </div>
    </div>
  );
};

export const UserPopover = ({
  id,
  open,
  anchorEl,
  functions,
}: UserPopoverProps) => {
  const { handleClose } = functions;
  const user = useAppSelector((state) => state.user);

  return useBreakpoint() === 'sm' ? (
    <CustomModal
      hasOpenButton={false}
      externalStatus={open}
      title={
        <div className="flex text-2xl">
          Hello, <div className="ml-1 font-bold">{user.username}</div>
        </div>
      }
      handleClose={handleClose}
      closeButton={{ label: ' ', hide: true }}
    >
      <UserSection isModal handleClose={handleClose} />
    </CustomModal>
  ) : (
    <Popover
      id={id}
      open={open}
      anchorEl={anchorEl}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
    >
      <UserSection handleClose={handleClose} />
    </Popover>
  );
};
