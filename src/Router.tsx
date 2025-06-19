import { MemoryRouter, Routes, Route } from 'react-router';

import { App, Config } from 'components';

export const Router = () => {
  return (
    <MemoryRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/config" element={<Config />} />
      </Routes>
    </MemoryRouter>
  );
};
