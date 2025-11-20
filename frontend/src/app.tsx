import React from 'react';
// Biz yaratgan ekranlarni import qilamiz
import CreateTeamScreen from './components/CreateTeamScreen';
import JoinTeamScreen from './components/JoinTeamScreen';

// Tailwind CSS uchun asosiy stil fayli (agar kerak bo'lsa)
// import './index.css'; 

const App: React.FC = () => {
  // Hozircha bizda "routing" (yo'naltirish) yo'q.
  // Shuning uchun qaysi ekranni ko'rsatishni URL orqali aniqlaymiz.
  const path = window.location.pathname;
  const params = new URLSearchParams(window.location.search);

  // Agar URL /join?token=... bo'lsa, Jamoaga qo'shilish ekranini ko'rsat
  if (path.startsWith('/join') || params.has('token')) {
    return <JoinTeamScreen />;
  }

  // Agar URL /create-team bo'lsa, Jamoa yaratish ekranini ko'rsat
  if (path.startsWith('/create-team')) {
    return <CreateTeamScreen />;
  }

  // Boshqa barcha holatlarda Jamoa Yaratish ekranini ko'rsat (masalan)
  // Yoki bu yerda "Login" ekrani bo'lishi kerak
  return (
    <div>
      <h1>Asosiy Sahifa (Vaqtinchalik)</h1>
      <p><a href="/create-team">Jamoa Yaratish</a></p>
      <p><a href="/join?token=A1B2C3D4">Jamoaga Qo'shilish (Test)</a></p>
      {/* <CreateTeamScreen /> */}
    </div>
  );
};

export default App;
