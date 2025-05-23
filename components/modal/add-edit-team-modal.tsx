'use client';

import { useEffect, useState } from 'react';
import { CustomInput, InputProps } from '../custom/custom-input';
import { CustomModal } from '../custom/custom-modal';
import { ColumnsProps, RowsProps } from '../custom/custom-table';
import { Avatar } from '@mui/material';
import {
  getPlayerRating,
  getSportmonksPlayersDataByIds,
} from '@/sportmonks/common-methods';
import {
  SelectableTable,
  SelectableTableColumnKeysProps,
} from '../table/selectable-table';
import { TeamLogoPicker } from '../team-logo-picker';
import { fetchSportmonksApi } from '@/sportmonks/fetch-sportmonks-api';
import { RealTeamLogoIds } from '@/utils/real-team-logos';
import { EmptyMessage } from '../empty-message';
import {
  CompetitionsCollectionProps,
  TEAMS_PLAYERS_LIMIT,
} from '@/firebase/db-types';

// @ts-ignore
type HandleChangeParamProps = Parameters<InputProps['handleChange']>[0];
type PlayersColumnKeysProps = 'PLAYER' | 'POSITION' | 'RATING' | 'CLUB';

export type AddEditTeamModalDataProps = {
  logoId: RealTeamLogoIds;
  name: string;
  owner?: string;
  coach: string;
  selectedPlayerIds?: number[];
  competitionStarted?: CompetitionsCollectionProps['competitionStarted'];
};

export type AddEditTeamModalProps = {
  data?: Partial<AddEditTeamModalDataProps>;
  isEdit?: boolean;
  onSetData?: (data: AddEditTeamModalDataProps) => void;
  onMount?: () => void;
};

export const AddEditTeamModal = ({
  data,
  isEdit,
  onSetData,
  onMount,
}: AddEditTeamModalProps) => {
  const [pageCounter, setPageCounter] = useState(1);
  const [rows, setRows] = useState<any>([]);
  const [players, setPlayers] = useState<any[]>([]);
  const [avoidReload, setAvoidReload] = useState(false);

  const [logoId, setLogoId] = useState(data?.logoId);
  const [name, setName] = useState<HandleChangeParamProps>({
    value: data?.name || '',
    isValid: !!data?.name,
  });
  const [coach, setCoach] = useState<HandleChangeParamProps>({
    value: data?.coach || '',
    isValid: !!data?.coach,
  });
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<number[]>(
    data?.selectedPlayerIds || [],
  );

  const [disabled, setDisabled] = useState(true);
  const [initialSelectedPlayers, setInitialSelectedPlayers] = useState<
    RowsProps<PlayersColumnKeysProps>
  >([]);

  const columns: ColumnsProps<PlayersColumnKeysProps> = [
    { label: 'Player', id: 'PLAYER', minWidth: 200 },
    { label: 'Position', id: 'POSITION', align: 'center', minWidth: 100 },
    { label: 'Rating', id: 'RATING', align: 'center', minWidth: 50 },
    { label: 'Club', id: 'CLUB', align: 'center', minWidth: 50 },
  ];

  const mapPlayerRow = (player: any, index: number) => {
    const {
      id,
      image_path,
      display_name,
      detailedPosition,
      position,
      teams,
      statistics,
    } = player;
    const rating = getPlayerRating(statistics);
    const club = teams?.[0]?.team.short_code;

    return {
      INDEX: index + 1,
      ID: id,
      PLAYER: (
        <div className="flex gap-1">
          <Avatar
            src={image_path}
            alt={display_name}
            sx={{ width: 24, height: 24 }}
          />
          <span className="line-clamp-1">{display_name}</span>
        </div>
      ),
      POSITION: detailedPosition?.name || position?.name,
      RATING: rating,
      CLUB: club,
    };
  };

  // Whenever the players state changes we update the table rows here
  useEffect(() => {
    (async () => {
      const rows: RowsProps<PlayersColumnKeysProps> = (players as any)
        ?.map(
          (player: any, index: number) =>
            !selectedPlayerIds.includes(player.id) &&
            mapPlayerRow(player, index),
        )
        .filter(Boolean);

      setRows(rows);
    })();
  }, [players, selectedPlayerIds]);

  // Disable the inputs if they are not valid
  useEffect(() => {
    if (data?.competitionStarted) {
      setDisabled(true);
      return;
    }

    // The button is always available, till you select any of the players .. if so then you gotta select till the "TEAMS_PLAYERS_LIMIT" to have it available again
    let shouldDisable = !!(logoId && name?.value && coach?.value);
    if (isEdit && selectedPlayerIds?.length) {
      shouldDisable &&= selectedPlayerIds?.length === TEAMS_PLAYERS_LIMIT;
    }

    setDisabled(!shouldDisable);
  }, [logoId, name, coach, selectedPlayerIds]);

  // When opening the edit modal, we fetch all the first x players
  const getPlayers = async () => {
    const data = await fetchSportmonksApi('football/players');
    const filtered = data.data.filter((el) => el.teams.length > 0);
    setPlayers(filtered);
  };

  // When the end of the table is reached, we fetch the next players page
  const handleEndReached = async () => {
    const newPageCounter = pageCounter + 1;
    setPageCounter(newPageCounter);

    const data = await fetchSportmonksApi(
      'football/players',
      '',
      newPageCounter,
    );
    if (players)
      setPlayers([
        ...players,
        ...data.data.filter((el) => el.teams.length > 0),
      ]);
  };

  // The modal mounts whenever the parent component mounts, but our meaning of "mount" is whenever the modal is visible, so whenever that happens, we can do our shit (e.g some fetchs, which is not recommended to do in the parent component mount phase since we could be having a list of bunch instances of this modal (e.g. in the "Teams" admin tab) and do lots of fetching unnecessary)
  const handleMount = async () => {
    onMount?.();

    // If there are any initial players, then display them to the table
    if (data?.selectedPlayerIds) {
      const playersData = await getSportmonksPlayersDataByIds(
        data.selectedPlayerIds,
      );
      const mappedPlayers = playersData.map(mapPlayerRow);
      setInitialSelectedPlayers(mappedPlayers);
    }
  };

  const handleOpen = async () => {
    await handleMount();
    await getPlayers();
  };

  const handleClose = () => {
    setPageCounter(1); // Resetting the count so the next time we open up the modal we start from the beginning and not from the part we left it on
  };

  const handleSelectedRows = (
    selectedRows: RowsProps<
      SelectableTableColumnKeysProps<PlayersColumnKeysProps>
    >,
  ) => {
    const playerIds = selectedRows.map((row) => row.ID);
    setSelectedPlayerIds(playerIds);
  };

  const handleSetTeam = () => {
    if (data?.competitionStarted) return;

    if (logoId && name?.isValid && coach?.isValid) {
      onSetData?.({
        logoId,
        name: name.value,
        coach: coach.value,
        selectedPlayerIds:
          isEdit && selectedPlayerIds?.length === TEAMS_PLAYERS_LIMIT
            ? selectedPlayerIds
            : undefined,
      });
    }
  };

  const debounce = (func: any, delay: number) => {
    let timer: NodeJS.Timeout;
    return (...args: any) => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        func.apply(this, args);
      }, delay);
    };
  };

  const handlePlayerSearch = async (userData: {
    value: string;
    isValid: boolean;
  }) => {
    if (!userData) return;
    if (userData.isValid) {
      const response = await fetchSportmonksApi(
        `football/players/search`,
        userData.value,
      );
      const playersData: any[] = response.data;

      setAvoidReload(true);

      if (playersData) {
        const mappedPlayers = playersData.map((player, i) =>
          mapPlayerRow(player, i),
        );
        setRows(mappedPlayers);
      }
    } else {
      setAvoidReload(false);
      getPlayers();
    }
  };

  const debouncedFetchData = debounce(handlePlayerSearch, 700);

  return (
    <CustomModal
      title={isEdit ? `${name.value}` : 'Create your team'}
      unboldedTitle={isEdit ? "'s team" : ''}
      openButton={{
        label: isEdit ? 'Edit' : 'Create your team',
        className: isEdit ? '!w-1/4 !h-3/4' : 'w-full md:w-fit',
        handleClick: handleOpen,
        style: isEdit ? 'black' : 'main',
      }}
      closeButton={{
        label: `${isEdit ? 'Edit' : 'Create'} team`,
        handleClick: handleSetTeam,
        disabled,
      }}
      handleClose={handleClose}
    >
      <div className="flex flex-col gap-6 h-full">
        {data?.competitionStarted && (
          <EmptyMessage
            title="This team's competition has started."
            description="It means that you no longer can apply any modifications to its teams."
            noSpaces
            className="!bg-main-100 !p-8 !rounded-2xl"
          />
        )}
        <div className="flex flex-col gap-8 h-full">
          <div className="flex flex-col gap-4">
            <div className="font-bold">Choose information:</div>
            {/* ICON & NAME */}
            <div className="flex flex-col gap-2 md:flex-row">
              <TeamLogoPicker initialValue={logoId} getLogoId={setLogoId} />
              <CustomInput
                initialValue={name.value}
                label="Name"
                handleChange={setName}
              />
            </div>
            {/* COACH & OWNER */}
            <div className="flex flex-col gap-2 md:flex-row">
              <CustomInput
                initialValue={coach.value}
                label="Coach"
                handleChange={setCoach}
              />
              <CustomInput initialValue={data?.owner} label="Owner" disabled />
            </div>
          </div>
          {/* PLAYERS */}
          <div className="flex flex-col gap-2 h-full">
            <div className="flex flex-col gap-2 justify-between md:flex-row md:items-center">
              <div className="font-bold">
                Choose players:{' '}
                {isEdit && (
                  <span className="text-sm font-normal">
                    (only {TEAMS_PLAYERS_LIMIT})
                  </span>
                )}
              </div>
              <div className="w-90">
                <CustomInput
                  label="Search"
                  handleChange={(data) => debouncedFetchData(data)}
                />
              </div>
            </div>
            {isEdit ? (
              <SelectableTable<PlayersColumnKeysProps>
                columns={columns}
                rows={rows}
                onEndReached={handleEndReached}
                initialSelectedRows={initialSelectedPlayers}
                getSelectedRows={handleSelectedRows}
                avoidEndReload={avoidReload}
              />
            ) : (
              <EmptyMessage
                classNameDescription="!text-black"
                description="Ask your admin to add your players."
                noSpaces
              />
            )}
          </div>
        </div>
      </div>
    </CustomModal>
  );
};
