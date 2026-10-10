import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  Plus,
  ChevronLeft,
  ChevronRight,
  Clock,
  Video,
  FileText,
  Presentation,
  FolderKanban,
  CheckCircle2,
  Trash2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CalendarEvent } from '../../types';

interface CalendarPageProps {
  navigate: (path: string) => void;
}

export const CalendarPage: React.FC<CalendarPageProps> = ({ navigate }) => {
  const { currentUser, calendarEvents, addCalendarEvent, deleteCalendarEvent, projects } = useApp();

  if (!currentUser) {
    return null;
  }

  // State for calendar month navigation (anchored at October 2026 as in screenshot)
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(9); // 0-indexed, 9 = October
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  // Add Event Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<CalendarEvent['type']>('meeting');
  const [newDate, setNewDate] = useState('2026-10-15');
  const [newTime, setNewTime] = useState('10:00 AM');
  const [newProjectId, setNewProjectId] = useState('');
  const [newDescription, setNewDescription] = useState('');

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // Calendar Days calculation
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay(); // 0 is Sunday
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

  const calendarCells = [];
  // Previous month trailing days
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    calendarCells.push({ day: daysInPrevMonth - i, isCurrentMonth: false });
  }
  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    calendarCells.push({ day: d, isCurrentMonth: true });
  }
  // Next month leading days
  const remainingCells = 35 - calendarCells.length;
  for (let d = 1; d <= (remainingCells < 0 ? 42 - calendarCells.length : remainingCells); d++) {
    calendarCells.push({ day: d, isCurrentMonth: false });
  }

  // Filter events by selected day
  const filteredEvents = selectedDay
    ? calendarEvents.filter((e) => {
        const parts = e.date.split('-');
        return Number(parts[2]) === selectedDay && Number(parts[1]) === currentMonth + 1;
      })
    : calendarEvents;

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const matchedProject = projects.find((p) => p.id === newProjectId);

    addCalendarEvent({
      title: newTitle.trim(),
      type: newType,
      date: newDate,
      time: newTime,
      projectId: newProjectId || undefined,
      projectName: matchedProject?.title,
      description: newDescription,
    });

    setIsModalOpen(false);
    setNewTitle('');
    setNewDescription('');
  };

  const getEventIcon = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'meeting':
        return (
          <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
            <Video className="w-4 h-4" />
          </div>
        );
      case 'submission':
        return (
          <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
            <FolderKanban className="w-4 h-4" />
          </div>
        );
      case 'report':
        return (
          <div className="w-10 h-10 rounded-full bg-[#DDF5EA] text-[#0E9F6E] flex items-center justify-center shrink-0">
            <FileText className="w-4 h-4" />
          </div>
        );
      case 'presentation':
        return (
          <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
            <Presentation className="w-4 h-4" />
          </div>
        );
      default:
        return (
          <div className="w-10 h-10 rounded-full bg-blue-100 text-[#0B6BE6] flex items-center justify-center shrink-0">
            <CalendarIcon className="w-4 h-4" />
          </div>
        );
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Page Header matching Page 17 */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pb-4 border-b border-[#E3EAF3]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0B2A55] tracking-tight">Calendar & Deadlines</h1>
          <p className="text-xs text-[#6B7A90] mt-1">
            Academic schedule, lab sprint deliverables, submission targets, and colloquium dates
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-[#0B6BE6] hover:bg-blue-600 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Event</span>
        </button>
      </div>

      {/* Grid: Left Month Calendar + Right Upcoming Events matching Page 17 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left 7 Cols: Interactive Month Grid matching Page 17 */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-7 rounded-3xl border border-[#E3EAF3] shadow-xs space-y-6">
          {/* Month Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-lg font-black text-[#0B2A55]">
              {monthNames[currentMonth]} {currentYear}
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevMonth}
                className="p-2 hover:bg-slate-100 rounded-xl text-slate-600 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNextMonth}
                className="p-2 hover:bg-slate-100 rounded-xl text-slate-600 transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Weekday Header */}
          <div className="grid grid-cols-7 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Day Cells as rounded squares matching Page 17 */}
          <div className="grid grid-cols-7 gap-2">
            {calendarCells.map((cell, idx) => {
              const isSelected = cell.isCurrentMonth && selectedDay === cell.day;
              // Check if day has event
              const dayEvents = calendarEvents.filter((e) => {
                const parts = e.date.split('-');
                return Number(parts[2]) === cell.day && Number(parts[1]) === currentMonth + 1;
              });
              const hasEvents = cell.isCurrentMonth && dayEvents.length > 0;

              return (
                <div
                  key={idx}
                  onClick={() => {
                    if (cell.isCurrentMonth) {
                      setSelectedDay(selectedDay === cell.day ? null : cell.day);
                    }
                  }}
                  className={`aspect-square p-2 rounded-2xl flex flex-col items-center justify-between text-xs transition-all cursor-pointer relative ${
                    !cell.isCurrentMonth
                      ? 'text-slate-300 bg-slate-50/50'
                      : isSelected
                      ? 'bg-[#F05A28] text-white font-extrabold shadow-md'
                      : 'hover:bg-blue-50 text-[#0B2A55] font-semibold bg-[#F5F8FC]/50 border border-slate-100'
                  }`}
                >
                  <span>{cell.day}</span>

                  {/* Colored dots for events matching Page 17 */}
                  {hasEvents && (
                    <div className="flex gap-1 mt-auto">
                      {dayEvents.slice(0, 3).map((e, ei) => (
                        <span
                          key={ei}
                          className={`w-1.5 h-1.5 rounded-full ${
                            isSelected
                              ? 'bg-white'
                              : e.type === 'meeting'
                              ? 'bg-red-500'
                              : e.type === 'submission'
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {selectedDay && (
            <div className="pt-2 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100">
              <span>Filtered by day: {selectedDay} {monthNames[currentMonth]}</span>
              <button
                onClick={() => setSelectedDay(null)}
                className="text-[#0B6BE6] font-bold hover:underline"
              >
                Clear Day Filter
              </button>
            </div>
          )}
        </div>

        {/* Right 5 Cols: Upcoming Events list matching Page 17 */}
        <div className="lg:col-span-5 bg-white p-6 sm:p-7 rounded-3xl border border-[#E3EAF3] shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-extrabold text-base text-[#0B2A55]">Upcoming Events</h3>
            <span className="text-xs font-bold text-slate-400">
              {filteredEvents.length} scheduled
            </span>
          </div>

          <div className="space-y-3">
            {filteredEvents.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No events on this date.</p>
            ) : (
              filteredEvents.map((evt) => (
                <div
                  key={evt.id}
                  className="p-3.5 rounded-2xl border border-slate-100 bg-[#F5F8FC]/80 hover:bg-white hover:shadow-xs transition-all flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {getEventIcon(evt.type)}
                    <div className="space-y-0.5 min-w-0">
                      <h4 className="font-extrabold text-xs sm:text-sm text-[#0B2A55] truncate">
                        {evt.title}
                      </h4>
                      {evt.projectName && (
                        <p className="text-[11px] text-[#6B7A90] truncate">{evt.projectName}</p>
                      )}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-xs font-bold text-[#0B2A55]">{evt.date}</p>
                    <p className="text-[11px] text-slate-400">{evt.time}</p>
                    <button
                      onClick={() => deleteCalendarEvent(evt.id)}
                      className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition-opacity p-0.5 mt-0.5"
                      title="Delete event"
                    >
                      <Trash2 className="w-3.5 h-3.5 ml-auto" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Add Event Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-3xl shadow-2xl p-6 sm:p-8 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-base text-[#0B2A55]">Schedule Calendar Event</h3>
              <button onClick={() => setIsModalOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-[#0B2A55] block mb-1">Event Title *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Model Architecture Presentation"
                  className="w-full bg-[#F5F8FC] border border-[#E3EAF3] p-2.5 rounded-xl font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#0B2A55] block mb-1">Event Type</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full bg-[#F5F8FC] border border-[#E3EAF3] p-2.5 rounded-xl"
                  >
                    <option value="meeting">Meeting</option>
                    <option value="submission">Submission</option>
                    <option value="report">Report</option>
                    <option value="presentation">Presentation</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-[#0B2A55] block mb-1">Time</label>
                  <input
                    type="text"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    placeholder="10:00 AM"
                    className="w-full bg-[#F5F8FC] border border-[#E3EAF3] p-2.5 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-[#0B2A55] block mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full bg-[#F5F8FC] border border-[#E3EAF3] p-2.5 rounded-xl font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-[#0B2A55] block mb-1">Associated Project (Optional)</label>
                <select
                  value={newProjectId}
                  onChange={(e) => setNewProjectId(e.target.value)}
                  className="w-full bg-[#F5F8FC] border border-[#E3EAF3] p-2.5 rounded-xl"
                >
                  <option value="">No specific project</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-[#0B2A55] block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Meeting agenda or submission instructions..."
                  className="w-full bg-[#F5F8FC] border border-[#E3EAF3] p-2.5 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 font-bold text-slate-500"
                >
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 bg-[#0B6BE6] text-white font-bold rounded-xl">
                  Save Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
