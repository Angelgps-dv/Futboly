'use client';

import { createTheme, Tab, Tabs, ThemeProvider } from '@mui/material';
import { AdminTab } from './admin-tab/admin-tab';
import { useSwitchComponents } from '@/utils/switch-components';
import { StandingsTab } from './standings-tab';
import { CompetitionsTab } from './competitions-tab';
import { LiveMatch } from './live-match-tab';
import { Matches } from './matches-tab';
import { TeamsTab } from './teams-tab';
import { useGetLeagues } from '@/data/leagues/use-get-leagues';
import { useEffect, useState } from 'react';

export const AppTabs = () => {
  const { isUserLeagueOwner } = useGetLeagues();

  const [tabComponents, setTabComponents] = useState([
    { label: 'Competitions', Component: () => <CompetitionsTab /> },
    { label: 'Standings', Component: () => <StandingsTab /> },
    { label: 'Teams', Component: () => <TeamsTab /> },
    { label: 'Matches', Component: () => <Matches /> },
    { label: 'Live Match', Component: () => <LiveMatch /> },
  ]);

  const isUserOwner = isUserLeagueOwner();
  useEffect(() => {
    if (isUserOwner) {
      setTabComponents([
        ...tabComponents,
        { label: 'Admin', Component: () => <AdminTab /> },
      ]);
    }
  }, [isUserOwner]);

  const {
    currentComponentId,
    components,
    setComponentId,
    SwitchedComponent,
    isCurrentId,
  } = useSwitchComponents(tabComponents);

  const theme = createTheme({
    palette: {
      primary: {
        main: '#F03ED7',
      },
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <div className="flex flex-col gap-8">
        <Tabs
          classes={{ scrollableX: 'md:flex md:justify-center' }}
          value={currentComponentId}
          textColor="primary"
          indicatorColor="primary"
          scrollButtons
          allowScrollButtonsMobile
          variant="scrollable"
        >
          {components.map(({ id, label }) => (
            <Tab
              className={`normal-case ${
                isCurrentId(id) ? 'text-main font-bold' : 'text-gray'
              }`}
              key={id}
              value={id}
              label={label}
              onClick={() => setComponentId(id)}
            />
          ))}
        </Tabs>

        {SwitchedComponent?.()}
      </div>
    </ThemeProvider>
  );
};
