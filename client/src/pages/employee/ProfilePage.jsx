import { useState } from 'react';
import { mockAttendanceHistory, mockProfile } from '../../data/mockData';

export default function ProfilePage() {
  const [avatar, setAvatar] = useState('https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop&crop=faces');

  const updateAvatar = (event) => {
    const file = event.target.files?.[0];
    if (file) setAvatar(URL.createObjectURL(file));
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">Profile</p>
        <div className="mt-5 flex flex-col items-center text-center">
          <img src={avatar} alt={mockProfile.name} className="h-32 w-32 rounded-full border-4 border-white object-cover shadow-lg" />
          <label className="mt-4 inline-flex cursor-pointer rounded-2xl bg-slate-900 px-4 py-3 text-sm font-bold text-white">
            Update photo
            <input type="file" accept="image/*" className="hidden" onChange={updateAvatar} />
          </label>
          <h2 className="mt-5 text-2xl font-black tracking-tight text-slate-900">{mockProfile.name}</h2>
          <p className="text-sm text-slate-500">{mockProfile.role} · {mockProfile.department}</p>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {[
            ['Employee ID', mockProfile.employeeId],
            ['Email', mockProfile.email],
            ['Phone', mockProfile.phone],
            ['Location', mockProfile.location],
            ['Join Date', mockProfile.joinDate],
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl bg-slate-50 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{label}</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">{value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5">
        <h3 className="text-xl font-bold text-slate-900">Recent attendance</h3>
        <div className="mt-4 space-y-3">
          {mockAttendanceHistory.map((entry) => (
            <div key={entry.id} className="rounded-2xl border border-slate-200 p-4">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-slate-900">{entry.date}</p>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{entry.status}</span>
              </div>
              <p className="mt-2 text-sm text-slate-500">Check-in: {entry.checkIn} · Check-out: {entry.checkOut} · Duration: {entry.duration}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}