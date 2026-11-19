import { supabase } from '@/services/firebase/supabaseClient';
import type { StickyNote, NewStickyNote } from '@/types';

export async function fetchNotes(): Promise<StickyNote[]> {
  const { data, error } = await supabase
    .from('sticky_notes')
    .select('*')
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as StickyNote[];
}

export async function createNote(note: NewStickyNote): Promise<StickyNote> {
  const { data, error } = await supabase
    .from('sticky_notes')
    .insert({
      content: note.content,
      color: note.color,
      author_identity: note.author_identity,
    })
    .select()
    .single();
  if (error) throw error;
  return data as StickyNote;
}

export async function updateNote(
  id: string,
  updates: { content: string; color: NewStickyNote['color'] },
): Promise<StickyNote> {
  const { data, error } = await supabase
    .from('sticky_notes')
    .update({ content: updates.content, color: updates.color })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as StickyNote;
}

export async function deleteNote(id: string): Promise<void> {
  const { error } = await supabase.from('sticky_notes').delete().eq('id', id);
  if (error) throw error;
}

export function subscribeToNotes(
  callback: (notes: StickyNote[]) => void,
): () => void {
  const channel = supabase
    .channel('sticky_notes_changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'sticky_notes' },
      () => {
        fetchNotes()
          .then(callback)
          .catch((err) => console.error('notes subscription fetch failed', err));
      },
    )
    .subscribe();
  return () => {
    supabase.removeChannel(channel);
  };
}
