import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import StickyNoteBoard from '@/components/sticky-notes/StickyNoteBoard';
import { fetchNotes, subscribeToNotes } from '@/services/sticky-notes/stickyNoteService';
import type { StickyNote } from '@/types';

export default function PinboardPage() {
  const { identity } = useAuth();
  const [notes, setNotes] = useState<StickyNote[]>([]);

  const refresh = useCallback(async () => setNotes(await fetchNotes()), []);

  useEffect(() => {
    refresh();
    const unsub = subscribeToNotes(() => refresh());
    return () => unsub();
  }, [refresh]);

  if (!identity) return null;

  return (
    <div className="max-w-3xl mx-auto">
      <StickyNoteBoard notes={notes} identity={identity} onChanged={refresh} />
    </div>
  );
}
