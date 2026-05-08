import { useState } from 'react';
import QRScanner from './components/QRScanner';

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <QRScanner />
    </div>
  );
}
