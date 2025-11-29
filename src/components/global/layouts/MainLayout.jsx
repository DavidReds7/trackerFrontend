import React from 'react';

export const MainLayout = ({ children, header }) => (
  <div className="app-shell">
    {header}
    <main className="app-content">{children}</main>
  </div>
);
