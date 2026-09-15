'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { Calendar, Plus, Clock, MapPin, User } from 'lucide-react';

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
      <div className="flex justify-between items-center border-b border-border pb-4">
        <div>
          <h2 className="text-2xl font-bold text-main tracking-tight">Timetable</h2>
          <p className="text-secondary text-sm mt-1">Weekly class schedule</p>
        </div>
        {user?.role === 'ADMIN' && (
          <button className="btn btn-primary flex items-center">
            <Plus size={16} className="mr-2" /> Add Class Time
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">
        {loading ? (
          <div className="col-span-full flex justify-center py-20"><div className="spinner"></div></div>
        ) : (
          days.map((day) => {
            const classes = getClassesForDay(day);
            return (
              <div key={day} className="bg-surface rounded-xl border border-border shadow-sm flex flex-col h-full min-h-[400px]">
                <div className="bg-background/50 py-3 px-4 border-b border-border text-center font-bold text-main rounded-t-xl uppercase tracking-wider text-sm">
                  {day}
                </div>
                <div className="p-3 flex-1 flex flex-col space-y-3 bg-background/20">
                  {classes.map((c) => (
                    <div key={c._id} className="bg-surface p-3 rounded-lg border border-border border-l-4 border-l-primary shadow-sm hover:shadow transition-shadow">
                      <div className="text-xs font-bold text-primary mb-1 flex items-center">
                        <Clock size={12} className="mr-1" />
                        {c.startTime} - {c.endTime}
                      </div>
                      <div className="font-semibold text-main leading-tight mb-2">{c.subject?.name}</div>
                      <div className="text-xs text-secondary flex flex-col space-y-1">
                        <div className="flex items-center">
                          <MapPin size={12} className="mr-1" />
                          <span>{c.roomNumber}</span>
                        </div>
                        <div className="flex items-center">
                          <User size={12} className="mr-1" />
                          <span className="truncate">{user?.role === 'TEACHER' ? `Section ${c.class?.section || 'A'}` : `${c.teacher?.firstName || ''} ${c.teacher?.lastName || ''}`}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {classes.length === 0 && (
                    <div className="flex-1 flex flex-col items-center justify-center text-secondary">
                      <Calendar size={24} className="text-border mb-2" />
                      <span className="text-xs font-medium uppercase tracking-widest text-secondary/50">Free</span>
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
