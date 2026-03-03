import React, { useState } from 'react';
import SoundPreference from './Pages/SoundPreference.tsx';
import LifestyleExploration from './Pages/LifestyleExploration.tsx';

function App() {
  const [currentPage, setCurrentPage] = useState<'sound' | 'lifestyle'>('sound');

  return currentPage === 'sound' ? (
    <SoundPreference onCompleted={() => setCurrentPage('lifestyle')} />
  ) : (
    <LifestyleExploration onNext={() => setCurrentPage('sound')} onBack={() => setCurrentPage('sound')} />
  );
}

export default App;
