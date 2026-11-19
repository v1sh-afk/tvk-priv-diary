import { useEffect, useState, useCallback } from 'react';
import { Pin, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import MemoryCalendar from '@/components/calendar/MemoryCalendar';
import DiaryEditor from '@/components/diary/DiaryEditor';
import StickyNoteBoard from '@/components/sticky-notes/StickyNoteBoard';
import { fetchEntriesForMonth, subscribeToEntries } from '@/services/diary/diaryService';
import { fetchNotes, subscribeToNotes } from '@/services/sticky-notes/stickyNoteService';
import { toDateString } from '@/utils/time';
import type { DiaryEntry, StickyNote } from '@/types';

export default function HomePage() {
  const { identity } = useAuth();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [monthEntries, setMonthEntries] = useState<DiaryEntry[]>([]);
  const [dayEntries, setDayEntries] = useState<DiaryEntry[]>([]);
  const [notes, setNotes] = useState<StickyNote[]>([]);
  const [showMobileNotes, setShowMobileNotes] = useState(false);

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  const refreshMonth = useCallback(async () => {
    const entries = await fetchEntriesForMonth(year, month);
    setMonthEntries(entries);
  }, [year, month]);

  const refreshNotes = useCallback(async () => {
    setNotes(await fetchNotes());
  }, []);

  useEffect(() => {
    refreshMonth();
    refreshNotes();
    const unsubEntries = subscribeToEntries(() => { refreshMonth(); });
    const unsubNotes = subscribeToNotes(() => { refreshNotes(); });
    return () => { unsubEntries(); unsubNotes(); };
  }, [refreshMonth, refreshNotes]);

  useEffect(() => {
    if (!selectedDate) {
      setDayEntries([]);
      return;
    }
    setDayEntries(monthEntries.filter((e) => e.entry_date === selectedDate));
  }, [selectedDate, monthEntries]);

  if (!identity) return null;

  return (
    <div className="relative">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">
        {/* Main column */}
        <div className="flex flex-col gap-5 min-w-0">
          <MemoryCalendar
            entries={monthEntries}
            onSelectDate={(d) => setSelectedDate(d)}
          />

          <AnimatePresence>
            {selectedDate && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
              >
                <DiaryEditor
                  date={selectedDate}
                  entries={dayEntries}
                  identity={identity}
                  onChanged={refreshMonth}
                  onClose={() => setSelectedDate(null)}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {!selectedDate && (
            <div className="bg-navy/50 backdrop-blur-md border border-cyan-glow/15 pixel-border p-6 text-center">
              <p className="text-sm text-muted">
                Select a day on the calendar to read or write a memory.
              </p>
              <p className="text-[0.65rem] text-muted/70 mt-1">
                Today is {toDateString(now)} — click today's date to begin.
              </p>
            </div>
          )}
        </div>

        {/* Sidebar (desktop) */}
        <aside className="hidden lg:block">
          <StickyNoteBoard notes={notes} identity={identity} onChanged={refreshNotes} />
        </aside>
      </div>

      {/* Mobile floating pinboard button */}
      <button
        onClick={() => setShowMobileNotes(true)}
        className="lg:hidden fixed bottom-5 right-5 z-40 flex items-center gap-2 px-4 py-3 bg-navy-deep border border-coral/50 text-coral font-arcade text-[0.5rem] shadow-glow"
      >
        <Pin size={14} /> NOTES
      </button>

      <AnimatePresence>
        {showMobileNotes && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 260, damping: 28 }}
            className="lg:hidden fixed inset-y-0 right-0 z-50 w-[88%] max-w-sm bg-navy-deep/95 backdrop-blur-md border-l border-cyan-glow/30 p-4 overflow-y-auto"
          >
            <button
              onClick={() => setShowMobileNotes(false)}
              className="absolute top-3 right-3 p-1.5 text-muted hover:text-ink"
              aria-label="Close"
            >
              <X size={18} />
            </button>
            <StickyNoteBoard notes={notes} identity={identity} onChanged={refreshNotes} compact />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
