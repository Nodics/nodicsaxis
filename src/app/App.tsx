import { Navigate, Route, Routes } from 'react-router';

import { WelcomePage } from './WelcomePage';

export function App() {
  return (
    <Routes>
      <Route path="/" element={<WelcomePage />} />
      <Route path="*" element={<Navigate replace to="/" />} />
    </Routes>
  );
}
