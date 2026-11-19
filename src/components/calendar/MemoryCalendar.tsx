import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, CalendarHeart } from 'lucide-react';
import type { DiaryEntry } from '@/types';
import { toDateString } from '@/utils/time';

type Props = {
  entries: DiaryEntry[];
  onSelectDate: (date: string) => void;
};

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTHS = [
  'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
  'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER',
];

export default function MemoryCalendar({ entries, onSelectDate }: Props) {
  const today = new Date();
  const [cursor, setCursor] = useState({ year: today.getFullYear(), month: today.getMonth() });

  const entryCountByDate = useMemo(() => {
    const map: Record<string, number> = {};
    for (const e of entries) {
      map[e.entry_date] = (map[e.entry_date] ?? 0) + 1;
    }
    return map;
  }, [entries]);

  const grid = useMemo(() => {
    const first = new Date(cursor.year, cursor.month, 1);
    const startDay = first.getDay();
    const daysInMonth = new Date(cursor.year, cursor.month + 1, 0).getDate();
    const cells: (Date | null)[] = [];
    for (let i = 0; i < startDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(cursor.year, cursor.month, d));
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [cursor]);

  const todayStr = toDateString(today);

  const go = (delta: number) => {
    setCursor((c) => {
      const m = c.month + delta;
      if (m < 0) return { year: c.year - 1, month: 11 };
      if (m > 11) return { year: c.year + 1, month: 0 };
      return { year: c.year, month: m };
    });
  };

  const resetToday = () => setCursor({ year: today.getFullYear(), month: today.getMonth() });

  return (
    <div className="bg-navy/70 backdrop-blur-md border border-cyan-glow/20 pixel-border p-4 sm:p-5">
      <div className="flex items-center justify-between mb-4 gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <CalendarHeart size={18} className="text-cyan-glow shrink-0" />
          <h2 className="font-arcade text-[0.65rem] sm:text-[0.75rem] text-ink truncate">
            {MONTHS[cursor.month]} {cursor.year}
          </h2>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => go(-1)}
            className="p-1.5 text-muted hover:text-cyan-glow transition-colors"
            aria-label="Previous month"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={resetToday}
            className="font-arcade text-[0.5rem] text-cyan-glow px-2 py-1 border border-cyan-glow/30 hover:bg-cyan-glow/10 transition-colors"
          >
            TODAY
          </button>
          <button
            onClick={() => go(1)}
            className="p-1.5 text-muted hover:text-cyan-glow transition-colors"
            aria-label="Next month"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 sm:gap-1.5 mb-2">
        {WEEKDAYS.map((d, i) => (
          <div
            key={i}
            className="text-center font-arcade text-[0.5rem] text-muted py-1"
          >
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
        {grid.map((date, i) => {
          if (!date) return <div key={i} className="aspect-square" />;
          const ds = toDateString(date);
          const count = entryCountByDate[ds] ?? 0;
          const isToday = ds === todayStr;
          const hasEntries = count > 0;
          return (
            <button
              key={i}
              onClick={() => onSelectDate(ds)}
              className={`relative aspect-square grid place-items-center text-sm transition-all border ${
                isToday
                  ? 'border-cyan-glow bg-cyan-glow/15 text-cyan-glow'
                  : hasEntries
                    ? 'border-coral/40 bg-coral/10 text-ink hover:border-coral'
                    : 'border-transparent text-muted hover:border-cyan-glow/30 hover:text-ink'
              }`}
            >
              <span className={isToday ? 'font-arcade text-[0.55rem]' : ''}>{date.getDate()}</span>
              {hasEntries && (
                <span className="absolute bottom-1 right-1 flex items-center gap-0.5">
                  <span
                    className="w-1.5 h-1.5 bg-coral"
                    style={{ imageRendering: 'pixelated' }}
                  />
                  {count > 1 && (
                    <span className="text-[0.5rem] text-coral font-arcade">{count}</span>
                  )}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex items-center gap-4 text-[0.6rem] text-muted">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 bg-cyan-glow" /> Today
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 bg-coral" /> Memory saved
        </span>
      </div>

      <AnimatePresence>
        <motion.div
          key={`${cursor.year}-${cursor.month}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="sr-only"
        >
          {MONTHS[cursor.month]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
