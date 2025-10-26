import React from 'react';
import { AuthProvider } from './context/AuthContext';
import AppShell from './components/layout/AppShell';
import './App.css';

export default function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}
