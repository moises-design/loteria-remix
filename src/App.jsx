import { useState } from 'react';
import { useGameStore } from './store/gameStore';
import HomeScreen from './screens/HomeScreen';
import ClassicMenuScreen from './screens/ClassicMenuScreen';
import ClassicSingleScreen from './screens/ClassicSingleScreen';
import ClassicCallerScreen from './screens/ClassicCallerScreen';
import ActItOutScreen from './screens/ActItOutScreen';
import CustomPhotoDeckScreen from './screens/CustomPhotoDeckScreen';
import MillennialModeScreen from './screens/MillennialModeScreen';
import SettingsScreen from './screens/SettingsScreen';
import OnboardingScreen from './screens/OnboardingScreen';
import MiniGamesScreen from './screens/MiniGamesScreen';
import MatchPairsScreen from './screens/MatchPairsScreen';
import LightningRoundScreen from './screens/LightningRoundScreen';
import NameItScreen from './screens/NameItScreen';
import CardBlitzScreen from './screens/CardBlitzScreen';
import DailyChallengeScreen from './screens/DailyChallengeScreen';
import LeaderboardScreen from './screens/LeaderboardScreen';
import StudyModeScreen from './screens/StudyModeScreen';
import './styles/global.css';

const ONBOARDING_KEY = 'loteria-onboarded-v1';

export default function App() {
  const { mode } = useGameStore();
  const [onboarded, setOnboarded] = useState(() => !!localStorage.getItem(ONBOARDING_KEY));

  if (!onboarded) {
    return (
      <div style={{ width:'100%', height:'100%', overflow:'hidden' }}>
        <OnboardingScreen onDone={() => { localStorage.setItem(ONBOARDING_KEY,'1'); setOnboarded(true); }} />
      </div>
    );
  }

  const screens = {
    'home': HomeScreen,
    'classic-menu': ClassicMenuScreen,
    'classic-single': ClassicSingleScreen,
    'classic-caller': ClassicCallerScreen,
    'act-it-out': ActItOutScreen,
    'custom-photo-deck': CustomPhotoDeckScreen,
    'millennial-mode': MillennialModeScreen,
    'settings': SettingsScreen,
    'mini-games': MiniGamesScreen,
    'match-pairs': MatchPairsScreen,
    'lightning-round': LightningRoundScreen,
    'name-it': NameItScreen,
    'card-blitz': CardBlitzScreen,
    'daily-challenge': DailyChallengeScreen,
    'leaderboard': LeaderboardScreen,
    'study-mode': StudyModeScreen,
  };

  const Screen = screens[mode] || HomeScreen;
  return (
    <div style={{ width:'100%', height:'100%', overflow:'hidden' }}>
      <Screen key={mode} />
    </div>
  );
}
