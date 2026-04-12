import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function Layout({ user, onLogout }) {
  return (
    <div className="min-h-screen lg:flex">
      <Sidebar user={user} onLogout={onLogout} />

      <main className="flex-1 w-full min-h-screen p-6 pt-20 lg:pt-6">
        <Outlet />
      </main>
    </div>
  );
}