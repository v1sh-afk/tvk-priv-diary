import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Pencil, Trash2, X, Check, Loader2 } from 'lucide-react';
import { fetchAllEntries, subscribeToEntries, updateEntry, deleteEntry } from '@/services/diary/diaryService';
import type { DiaryEntry, UserIdentity } from '@/types';
import { relativeTime } from '@/utils/time';

type AuthorFilter = 'all' | UserIdentity;

export default function MemoriesPage() {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [search, setSearch] = useState('');
  const [author, setAuthor] = useState<AuthorFilter>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const refresh = async () => setEntries(await fetchAllEntries());

  useEffect(() => {
    refresh();
    const unsub = subscribeToEntries(() => refresh());
    return () => unsub();
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return entries.filter((e) => {
      if (author !== 'all' && e.author_identity !== author) return false;
      if (!q) return true;
      return (
        e.title.toLowerCase().includes(q) || e.content.toLowerCase().includes(q)
      );
    });
  }, [entries, search, author]);

  const startEdit = (e: DiaryEntry) => {
    setEditingId(e.id);
    setEditTitle(e.title);
    setEditContent(e.content);
  };

  const saveEdit = async () => {
    if (!editingId) return;
    setSaving(true);
    try {
      await updateEntry(editingId, { title: editTitle.trim(), content: editContent });
      setEditingId(null);
      refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteEntry(id);
      setConfirmDeleteId(null);
      refresh();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-navy/70 backdrop-blur-md border border-cyan-glow/20 pixel-border p-4">
        <h2 className="font-arcade text-[0.75rem] text-ink mb-3">MEMORIES</h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search titles or content…"
              className="w-full bg-navy-deep/60 border border-cyan-glow/20 pl-9 pr-3 py-2 text-sm text-ink outline-none focus:border-cyan-glow/60 transition-colors placeholder:text-muted/60"
            />
          </div>
          <div className="flex items-center gap-1">
            {(['all', 'V', 'T'] as AuthorFilter[]).map((a) => (
              <button
                key={a}
                onClick={() => setAuthor(a)}
                className={`font-arcade text-[0.5rem] px-3 py-2 border transition-all ${
                  author === a
                    ? 'border-cyan-glow text-cyan-glow bg-cyan-glow/10'
                    : 'border-muted/30 text-muted hover:text-ink'
                }`}
              >
                {a === 'all' ? 'ALL' : a}
              </button>
            ))}
          </div>
        </div>
        <p className="text-[0.65rem] text-muted mt-3">
          {filtered.length} {filtered.length === 1 ? 'memory' : 'memories'}
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {filtered.length === 0 && (
          <p className="text-sm text-muted italic text-center py-8">
            No memories match your search.
          </p>
        )}
        {filtered.map((entry) => (
          <motion.div
            key={entry.id}
            layout
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-navy/70 backdrop-blur-md border border-cyan-glow/15 pixel-border p-4"
          >
            {editingId === entry.id ? (
              <div className="flex flex-col gap-2">
                <input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="bg-navy-deep/60 border border-cyan-glow/30 px-3 py-2 text-sm text-ink outline-none focus:border-cyan-glow"
                />
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={5}
                  className="bg-navy-deep/60 border border-cyan-glow/30 px-3 py-2 text-sm text-ink outline-none focus:border-cyan-glow resize-y"
                />
                <div className="flex items-center gap-2">
                  <button
                    onClick={saveEdit}
                    disabled={saving}
                    className="flex items-center gap-1 font-arcade text-[0.5rem] px-3 py-2 border border-cyan-glow/50 text-cyan-glow hover:bg-cyan-glow/10 disabled:opacity-40"
                  >
                    {saving ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />} SAVE
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="flex items-center gap-1 font-arcade text-[0.5rem] px-3 py-2 border border-muted/40 text-muted hover:text-ink"
                  >
                    <X size={12} /> CANCEL
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-ink text-sm">
                      {entry.title || 'Untitled'}
                    </h3>
                    <p className="text-[0.6rem] text-muted mt-0.5">
                      {new Date(entry.entry_date + 'T00:00:00').toLocaleDateString(undefined, { dateStyle: 'long' })}
                      {' · by '}
                      <span className="text-cyan-glow font-arcade">{entry.author_identity}</span>
                      {' · '}{relativeTime(entry.updated_at)}
                      {entry.updated_at !== entry.created_at && ' (edited)'}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => startEdit(entry)}
                      className="p-1.5 text-muted hover:text-cyan-glow transition-colors"
                      aria-label="Edit"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      onClick={() => setConfirmDeleteId(entry.id)}
                      className="p-1.5 text-muted hover:text-coral transition-colors"
                      aria-label="Delete"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-ink/90 whitespace-pre-wrap leading-relaxed line-clamp-6">
                  {entry.content}
                </p>

                {confirmDeleteId === entry.id && (
                  <div className="mt-3 flex items-center gap-2 text-[0.65rem]">
                    <span className="text-coral">Delete this memory?</span>
                    <button
                      onClick={() => handleDelete(entry.id)}
                      className="font-arcade text-[0.5rem] px-2 py-1 border border-coral/50 text-coral hover:bg-coral/10"
                    >
                      YES
                    </button>
                    <button
                      onClick={() => setConfirmDeleteId(null)}
                      className="font-arcade text-[0.5rem] px-2 py-1 border border-muted/40 text-muted hover:text-ink"
                    >
                      NO
                    </button>
                  </div>
                )}
              </>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
