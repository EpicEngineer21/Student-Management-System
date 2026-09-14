'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';

export default function TimetablePage() {
  const { user } = useAuth();
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  useEffect(() => {
    loadTimetable();
  }, []);

  const loadTimetable = async () => {
    try {
      let url = '/timetable';
      if (user?.role === 'STUDENT') url += `?student=${user.id}`;
      else if (user?.role === 'TEACHER') url += `?teacher=${user.id}`;
      
      const res = await api.get(url);
      setSchedule(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getClassesForDay = (day) => {
    return schedule.filter(s => s.day === day).sort((a, b) => a.startTime.localeCompare(b.startTime));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-dark">Timetable</h2>
          <p className="text-gray-500 text-sm">Weekly class schedule</p>
        </div>
        {user?.role === 'ADMIN' && (
          <button className="btn btn-primary">+ Add Class Time</button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">
        {loading ? (
          <div className="col-span-full flex justify-center py-20"><div className="spinner"></div></div>
        ) : (
          days.map((day) => {
            const classes = getClassesForDay(day);
            return (
              <div key={day} className="bg-white rounded-lg border border-gray-200 shadow-sm flex flex-col h-full min-h-[400px]">
                <div className="bg-gray-50 py-3 px-4 border-b border-gray-200 text-center font-bold text-dark rounded-t-lg">
                  {day}
                </div>
                <div className="p-3 flex-1 flex flex-col space-y-3 bg-gray-50/30">
                  {classes.map((c) => (
                    <div key={c._id} className="bg-white p-3 rounded border border-l-4 border-l-primary shadow-sm hover:shadow transition-shadow">
                      <div className="text-xs font-bold text-primary mb-1">{c.startTime} - {c.endTime}</div>
                      <div className="font-semibold text-dark leading-tight">{c.subject?.name}</div>
                      <div className="text-xs text-gray-500 mt-2 flex justify-between">
                        <span>{c.roomNumber}</span>
                        <span className="truncate ml-2">{user?.role === 'TEACHER' ? c.class?.section : c.teacher?.firstName}</span>
                      </div>
                    </div>
                  ))}
                  {classes.length === 0 && (
                    <div className="flex-1 flex items-center justify-center text-xs text-gray-400 italic">
                      No classes
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
