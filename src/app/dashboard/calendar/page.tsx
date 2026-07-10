"use client";

import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, addDoc, onSnapshot, getDoc, doc } from "firebase/firestore";
import { useState, useEffect, useMemo } from "react";
import {
  Calendar,
  Plus,
  Clock,
  Sparkles,
  RefreshCw,
  AlertCircle,
  Loader2,
  CalendarDays,
  Compass,
} from "lucide-react";
import { useOpportunities } from "@/hooks/useOpportunities";
import type { CalendarEvent, CalendarEventType } from "@/lib/types";

export default function CalendarPage() {
  const { currentUser } = useAuth();
  const { opportunities } = useOpportunities();
  const [customEvents, setCustomEvents] = useState<CalendarEvent[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  // Form states
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState("");
  const [dateStr, setDateStr] = useState("");
  const [type, setType] = useState<CalendarEventType>("reminder");
  const [desc, setDesc] = useState("");

  // Grid dates calculation
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  useEffect(() => {
    if (!currentUser) return;

    const loadEventsAndDeadlines = async () => {
      try {
        const list: CalendarEvent[] = [];

        // 1. Fetch custom events from firestore
        const q = query(collection(db, "calendar_events"), where("uid", "==", currentUser.uid));
        const customSnap = await getDocs(q);
        customSnap.forEach((d) => {
          list.push({ id: d.id, ...d.data() } as CalendarEvent);
        });
        setCustomEvents(list);

        // 2. Fetch bookmarks
        const bookSnap = await getDoc(doc(db, "bookmarks", currentUser.uid));
        if (bookSnap.exists()) {
          const ids: string[] = bookSnap.data().opportunityIds || [];
          setSavedIds(ids);
        } else {
          setSavedIds([]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadEventsAndDeadlines();
  }, [currentUser, syncing]);

  // Compute combined events list reactively when opportunities or bookmarks change
  const events = useMemo(() => {
    const list = [...customEvents];
    savedIds.forEach((id) => {
      const opp = opportunities.find((o) => o.id === id);
      if (opp) {
        list.push({
          id: `deadline_${opp.id}`,
          uid: currentUser?.uid || "",
          title: `${opp.title} (Deadline)`,
          date: opp.deadline,
          type: "deadline",
          description: `Deadline to apply for ${opp.organization}`,
          createdAt: new Date().toISOString(),
        });
      }
    });
    return list;
  }, [customEvents, savedIds, opportunities, currentUser]);

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !title.trim() || !dateStr) return;

    try {
      const newEvent = {
        uid: currentUser.uid,
        title: title.trim(),
        date: dateStr,
        type,
        description: desc.trim(),
        createdAt: new Date().toISOString(),
      };

      await addDoc(collection(db, "calendar_events"), newEvent);

      // Reset
      setTitle("");
      setDateStr("");
      setDesc("");
      setShowAddForm(false);
      setSyncing((s) => !s); // Trigger reload
    } catch (err) {
      console.error(err);
    }
  };

  const triggerGoogleSync = async () => {
    setSyncing(true);
    // Simulate API connection
    await new Promise((res) => setTimeout(res, 1500));
    setSyncing(false);
    alert("Simulated Google Calendar sync complete! 🌸");
  };

  // Basic calendar logic helper
  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  const daysInMonth = getDaysInMonth(currentMonth, currentYear);
  const firstDay = getFirstDayOfMonth(currentMonth, currentYear);

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand-purple animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-brand-navy flex items-center gap-2">
            <CalendarDays className="w-6 h-6 text-brand-purple" /> Calendar Hub
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Aggregate bookmarked application deadlines, schedule interviews, and custom reminders.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={triggerGoogleSync}
            disabled={syncing}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 transition-all shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? "animate-spin" : ""}`} />
            Sync Google Calendar
          </button>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-brand-purple hover:bg-brand-indigo text-white font-semibold text-xs rounded-xl shadow-sm transition-all"
          >
            <Plus className="w-3.5 h-3.5" /> New Event
          </button>
        </div>
      </div>

      {/* Add Custom Event Form */}
      {showAddForm && (
        <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm max-w-xl animate-in fade-in duration-200">
          <h3 className="font-bold text-slate-800 text-sm mb-4">Book New Calendar Entry</h3>
          <form onSubmit={handleAddEvent} className="space-y-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Event Title</label>
              <input
                type="text"
                placeholder="Interview with Stanford Committee"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full text-xs p-3 border border-slate-200 rounded-xl outline-none focus:border-brand-purple"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Event Date</label>
              <input
                type="date"
                value={dateStr}
                onChange={(e) => setDateStr(e.target.value)}
                required
                className="w-full text-xs p-3 border border-slate-200 rounded-xl outline-none focus:border-brand-purple"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Event Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as CalendarEventType)}
                className="w-full text-xs p-3 border border-slate-200 rounded-xl outline-none bg-white focus:border-brand-purple"
              >
                <option value="reminder">Reminder</option>
                <option value="interview">Interview Slot</option>
                <option value="event">Workshop / Hackathon</option>
                <option value="general">General</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Description</label>
              <input
                type="text"
                placeholder="Google Meet Link / Notes"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                className="w-full text-xs p-3 border border-slate-200 rounded-xl outline-none focus:border-brand-purple"
              />
            </div>
            <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 border border-slate-200 text-slate-650 rounded-xl text-xs font-semibold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-brand-purple text-white rounded-xl text-xs font-semibold hover:bg-brand-indigo shadow-sm"
              >
                Create Event
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Calendar & Agenda Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Calendar Grid View */}
        <div className="lg:col-span-2 bg-white border border-slate-100 p-6 rounded-3xl shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-slate-800 text-base">
              {months[currentMonth]} {currentYear}
            </h3>
            <div className="flex gap-1.5">
              <button
                onClick={prevMonth}
                className="p-2 border border-slate-200 rounded-xl text-xs font-bold hover:bg-slate-50 text-slate-600"
              >
                &larr; Prev
              </button>
              <button
                onClick={nextMonth}
                className="p-2 border border-slate-200 rounded-xl text-xs font-bold hover:bg-slate-50 text-slate-600"
              >
                Next &rarr;
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          <div className="grid grid-cols-7 gap-2 text-xs">
            {/* Pad first week */}
            {[...Array(firstDay)].map((_, i) => (
              <div key={`empty-${i}`} className="h-16 border border-transparent"></div>
            ))}

            {/* Days in Month */}
            {[...Array(daysInMonth)].map((_, i) => {
              const day = i + 1;
              const formattedDay = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const dayEvents = events.filter((e) => e.date === formattedDay);

              return (
                <div
                  key={`day-${day}`}
                  className="h-16 border border-slate-100 rounded-xl p-1.5 flex flex-col justify-between items-start group hover:border-brand-purple/40 hover:bg-slate-50/20 transition-all overflow-hidden"
                >
                  <span className="text-[10px] font-bold text-slate-650">{day}</span>
                  {dayEvents.length > 0 && (
                    <div className="w-full space-y-0.5 max-h-[28px] overflow-hidden">
                      {dayEvents.slice(0, 2).map((de) => (
                        <div
                          key={de.id}
                          className={`text-[8px] font-extrabold px-1 rounded truncate leading-tight uppercase ${
                            de.type === "deadline"
                              ? "bg-red-50 text-red-650"
                              : de.type === "interview"
                              ? "bg-purple-50 text-brand-purple"
                              : "bg-blue-50 text-blue-600"
                          }`}
                          title={de.title}
                        >
                          {de.title}
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <div className="text-[6px] text-slate-400 text-center font-bold">
                          +{dayEvents.length - 2} more
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Agenda View */}
        <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm space-y-6">
          <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-1.5">
            <Clock className="w-5 h-5 text-brand-purple" /> Upcoming Agenda
          </h3>

          <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
            {events
              .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
              .filter((e) => new Date(e.date).getTime() >= new Date().setHours(0, 0, 0, 0))
              .map((e) => (
                <div key={e.id} className="pb-4 border-b border-slate-50 last:border-0 last:pb-0 flex gap-3">
                  <div className="text-center">
                    <span className="block text-[8px] font-extrabold text-slate-400 uppercase">
                      {new Date(e.date).toLocaleDateString(undefined, { month: "short" })}
                    </span>
                    <span className="block text-lg font-extrabold text-brand-navy">
                      {new Date(e.date).getDate()}
                    </span>
                  </div>

                  <div className="flex-1 space-y-0.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase ${
                        e.type === "deadline"
                          ? "bg-red-50 text-red-650"
                          : e.type === "interview"
                          ? "bg-purple-50 text-brand-purple"
                          : "bg-blue-50 text-blue-600"
                      }`}>
                        {e.type}
                      </span>
                    </div>
                    <h5 className="font-bold text-xs text-slate-800">{e.title}</h5>
                    {e.description && (
                      <p className="text-[10px] text-slate-450 leading-relaxed font-semibold">
                        {e.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}

            {events.length === 0 && (
              <div className="text-center py-12">
                <Calendar className="w-8 h-8 text-slate-350 mx-auto mb-2" />
                <h5 className="font-bold text-slate-700 text-xs">No entries scheduled</h5>
                <p className="text-slate-450 text-[10px] mt-1">
                  Add deadlines from saved Opportunities, or create custom items using the New Event button.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
