import { supabase } from '@/services/firebase/supabaseClient';
import type { DiaryEntry, NewDiaryEntry } from '@/types';

export async function fetchEntriesForDate(date: string): Promise<DiaryEntry[]> {
  const { data, error } = await supabase
    .from('diary_entries')
    .select('*')
    .eq('entry_date', date)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data ?? []) as DiaryEntry[];
}

export async function fetchEntriesForMonth(year: number, month: number): Promise<DiaryEntry[]> {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const { data, error } = await supabase
    .from('diary_entries')
    .select('*')
    .gte('entry_date', first.toISOString().slice(0, 10))
    .lte('entry_date', last.toISOString().slice(0, 10))
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data ?? []) as DiaryEntry[];
}

export async function fetchAllEntries(): Promise<DiaryEntry[]> {
  const { data, error } = await supabase
    .from('diary_entries')
    .select('*')
    .order('entry_date', { ascending: false })
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as DiaryEntry[];
}

export async function createEntry(entry: NewDiaryEntry): Promise<DiaryEntry> {
  const { data, error } = await supabase
    .from('diary_entries')
    .insert({
      title: entry.title,
      content: entry.content,
      entry_date: entry.entry_date,
      author_identity: entry.author_identity,
    })
    .select()
    .single();
  if (error) throw error;
  return data as DiaryEntry;
}

export async function updateEntry(
  id: string,
  updates: { title: string; content: string },
): Promise<DiaryEntry> {
  const { data, error } = await supabase
    .from('diary_entries')
    .update({ title: updates.title, content: updates.content })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as DiaryEntry;
}

export async function deleteEntry(id: string): Promise<void> {
  const { error } = await supabase.from('diary_entries').delete().eq('id', id);
  if (error) throw error;
}

export function subscribeToEntries(
  callback: (entries: DiaryEntry[]) => void,
): () => void {
  const channel = supabase
    .channel('diary_entries_changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'diary_entries' },
      () => {
        fetchAllEntries()
          .then(callback)
          .catch((err) => console.error('diary subscription fetch failed', err));
      },
    )
    .subscribe();
  return () => {
    supabase.removeChannel(channel);
  };
}
