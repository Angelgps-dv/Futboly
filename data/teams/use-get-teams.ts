import { useAppSelector } from '@/store/hooks';
import { useGetCompetitions } from '../competitions/use-get-competitions';
import { useGetUsers } from '../users/use-get-users';
import { CompetitionsCollectionTeamsProps } from '@/firebase/db-types';
import { useGetLeagues } from '../leagues/use-get-leagues';
import { fetchSportmonksApi } from '@/sportmonks/fetch-sportmonks-api';

export type CompetitionsCollectionTeamsExtraProps =
  CompetitionsCollectionTeamsProps & {
    ownerUsername?: string;
    competitionName?: string;
  };

export const useGetTeams = () => {
  const team = useAppSelector((state) => state.team);
  const {
    getActiveCompetition,
    getCompetitionById,
    getCompetitionsByLeagueId,
  } = useGetCompetitions();
  const { getUserFromUui } = useGetUsers();
  const { getLeague } = useGetLeagues();

  const mapTeamWithExtraProps = async (
    team: CompetitionsCollectionTeamsProps,
  ) => {
    const userId = team.userRef.id;
    const userData = await getUserFromUui(userId);
    const ownerUsername = userData?.username;

    const competitionId = team.competitionRef.id;
    const competitionData = await getCompetitionById(competitionId);
    const competitionName = competitionData?.name;

    const newTeam: CompetitionsCollectionTeamsExtraProps = {
      ...team,
      ownerUsername,
      competitionName,
    };
    return newTeam;
  };

  // GET CURRENT TEAM FROM REDUX BASED ON CURRENT ACTIVE COMPETITION
  const getTeam = () => team?.currentTeam;

  // GET TEAM BY USER ID BASED ON CURRENT ACTIVE COMPETITION
  const getTeamByUid = (uid: string) => {
    const currentCompetition = getActiveCompetition();
    const competitionTeams = currentCompetition?.teams;

    if (competitionTeams) {
      const currentUserTeam = competitionTeams?.find(
        (team) => team.userRef.id === uid,
      );
      if (currentUserTeam) return currentUserTeam;
    }
  };

  // GET TEAM BY USER ID AND COMPETITION ID
  const getTeamByUidAndCompetitionId = async (
    uid: string,
    competitionId: string,
  ) => {
    const currentCompetition = await getCompetitionById(competitionId);
    const competitionTeams = currentCompetition?.teams;

    if (competitionTeams) {
      const currentUserTeam = competitionTeams?.find(
        (team) => team.userRef.id === uid,
      );
      if (currentUserTeam) return currentUserTeam;
    }
  };

  // GET ALL TEAMS FROM CURRENT COMPETITION
  const getAllTeams = async (incluceExtraProps?: boolean) => {
    const currentCompetition = getActiveCompetition();
    const competitionTeams = currentCompetition?.teams;
    if (!competitionTeams?.length) return;

    let allTeams: CompetitionsCollectionTeamsExtraProps[] = [];

    if (incluceExtraProps) {
      const teams: any = [];
      for await (const team of competitionTeams) {
        const mappedTeam = await mapTeamWithExtraProps(team);
        teams.push(mappedTeam);
      }
      allTeams = teams;
    } else {
      allTeams = competitionTeams;
    }

    if (allTeams?.length) return allTeams;
  };

  // GET ALL THE TEAMS FROM ALL THE COMPETITIONS BASED ON CURRENT LEAGUE
  const getAllTeamsFromAllCompetitions = async () => {
    const currentLeagueId = getLeague()?.id;
    const currentLeagueCompetitions = await getCompetitionsByLeagueId(
      currentLeagueId,
    );

    const allTeams = currentLeagueCompetitions
      .map((competition) => competition.teams)
      .flat();

    let mappedTeams: CompetitionsCollectionTeamsExtraProps[] = [];
    for await (const team of allTeams) {
      const mappedTeam = await mapTeamWithExtraProps(team);
      mappedTeams.push(mappedTeam);
    }

    return mappedTeams;
  };

  // GET PLAYERS SPORTMONKS DATA BASED ON AN ARRAY OF ITS IDS
  const getPlayersSportmonksData = async (playerIds: number[]) => {
    let playersData: any[] = [];

    for await (const playerId of playerIds) {
      const response = await fetchSportmonksApi(
        'football/players',
        `${playerId}`,
      );
      const data = response.data;
      if (data) playersData.push(data);
    }

    return playersData;
  };

  return {
    getTeam,
    getTeamByUid,
    getTeamByUidAndCompetitionId,
    getAllTeams,
    getAllTeamsFromAllCompetitions,
    getPlayersSportmonksData,
  };
};
