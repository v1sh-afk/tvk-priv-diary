import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Save, Trash2, X, Check, Loader2, Pencil } from 'lucide-react';
import type { DiaryEntry, UserIdentity } from '@/types';
import { createEntry, updateEntry, deleteEntry } from '@/services/diary/diaryService';
import { saveDraft, loadDraft, clearDraft } from '@/utils/drafts';
import { relativeTime } from '@/utils/time';

type Props = {
  date: string;
  entries: DiaryEntry[];
  identity: UserIdentity;
  onChanged: () => void;
  onClose: () => void;
};

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

export default function DiaryEditor({ date, entries, identity, onChanged, onClose }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // New-entry draft persistence
  const draftKey = `new-${date}`;
  useEffect(() => {
    if (!editingId) {
      const d = loadDraft(draftKey);
      if (d) {
        try {
          const parsed = JSON.parse(d);
          setTitle(parsed.title ?? '');
          setContent(parsed.content ?? '');
        } catch {
          // ignore
        }
      } else {
        setTitle('');
        setContent('');
      }
    }
  }, [draftKey, editingId]);

  useEffect(() => {
    if (!editingId) {
      saveDraft(draftKey, JSON.stringify({ title, content }));
    }
  }, [title, content, draftKey, editingId]);

  const startEdit = (entry: DiaryEntry) => {
    setEditingId(entry.id);
    setTitle(entry.title);
    setContent(entry.content);
    setSaveState('idle');
    setErrorMsg(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setTitle('');
    setContent('');
    setSaveState('idle');
    setErrorMsg(null);
  };

  const handleSave = async () => {
    if (!title.trim() && !content.trim()) {
      setErrorMsg('Write something before saving.');
      return;
    }
    setSaveState('saving');
    setErrorMsg(null);
    try {
      if (editingId) {
        await updateEntry(editingId, { title: title.trim(), content });
      } else {
        await createEntry({
          title: title.trim(),
          content,
          entry_date: date,
          author_identity: identity,
        });
        clearDraft(draftKey);
      }
      setSaveState('saved');
      setEditingId(null);
      setTitle('');
      setContent('');
      onChanged();
      setTimeout(() => setSaveState('idle'), 1800);
    } catch (err) {
      setSaveState('error');
      setErrorMsg(err instanceof Error ? err.message : 'Could not save.');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteEntry(id);
      setConfirmDeleteId(null);
      onChanged();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Could not delete.');
    }
  };

  const formattedDate = new Date(date + 'T00:00:00').toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="bg-navy/70 backdrop-blur-md border border-cyan-glow/20 pixel-border p-4 sm:p-5">
      <div className="flex items-center justify-between mb-4 gap-2">
        <div className="min-w-0">
          <h2 className="font-arcade text-[0.65rem] sm:text-[0.75rem] text-ink truncate">
            {formattedDate}
          </h2>
          <p className="text-[0.65rem] text-muted mt-1">
            {entries.length} {entries.length === 1 ? 'memory' : 'memories'} this day
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 text-muted hover:text-ink transition-colors shrink-0"
          aria-label="Close"
        >
          <X size={16} />
        </button>
      </div>

      {/* Existing entries */}
      <div className="flex flex-col gap-3 mb-4">
        {entries.length === 0 && !editingId && (
          <p className="text-sm text-muted italic">No memories yet for this day. Write one below.</p>
        )}
        {entries
          .filter((e) => e.id !== editingId)
          .map((entry) => (
            <div
              key={entry.id}
              className="border border-cyan-glow/15 bg-navy-deep/60 p-3"
            >
              <div className="flex items-start justify-between gap-2 mb-1">
                <div className="min-w-0">
                  {entry.title && (
                    <h3 className="font-semibold text-ink text-sm truncate">
                      {entry.title}
                    </h3>
                  )}
                  <p className="text-[0.6rem] text-muted mt-0.5">
                    by <span className="text-cyan-glow font-arcade">{entry.author_identity}</span>
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
              <p className="text-sm text-ink/90 whitespace-pre-wrap leading-relaxed">
                {entry.content}
              </p>

              {confirmDeleteId === entry.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-3 flex items-center gap-2 text-[0.65rem]"
                >
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
                </motion.div>
              )}
            </div>
          ))}
      </div>

      {/* Editor */}
      <div className="border-t border-cyan-glow/15 pt-4">
        <p className="font-arcade text-[0.5rem] text-cyan-glow mb-3 tracking-wider">
          {editingId ? 'EDIT MEMORY' : 'NEW MEMORY'}
          {' · '}<span className="text-muted">by {identity}</span>
        </p>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title (optional)"
          className="w-full bg-navy-deep/60 border border-cyan-glow/20 px-3 py-2 text-sm text-ink outline-none focus:border-cyan-glow/60 transition-colors mb-2 placeholder:text-muted/60"
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your memory…"
          rows={5}
          className="w-full bg-navy-deep/60 border border-cyan-glow/20 px-3 py-2 text-sm text-ink outline-none focus:border-cyan-glow/60 transition-colors resize-y leading-relaxed placeholder:text-muted/60"
        />

        {errorMsg && (
          <p className="text-[0.65rem] text-coral mt-2">{errorMsg}</p>
        )}

        <div className="flex items-center justify-between mt-3 gap-2">
          <div className="flex items-center gap-2 text-[0.6rem]">
            {saveState === 'saving' && (
              <span className="flex items-center gap-1 text-cyan-glow">
                <Loader2 size={12} className="animate-spin" /> SAVING…
              </span>
            )}
            {saveState === 'saved' && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-1 text-turquoise"
              >
                <Check size={12} /> SAVED
              </motion.span>
            )}
            {saveState === 'error' && (
              <span className="text-coral">ERROR</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {editingId && (
              <button
                onClick={cancelEdit}
                className="font-arcade text-[0.5rem] px-3 py-2 border border-muted/40 text-muted hover:text-ink transition-colors"
              >
                CANCEL
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={saveState === 'saving'}
              className="flex items-center gap-1.5 font-arcade text-[0.5rem] px-3 py-2 border border-cyan-glow/50 text-cyan-glow hover:bg-cyan-glow/10 transition-colors disabled:opacity-40"
            >
              <Save size={12} /> {editingId ? 'UPDATE' : 'SAVE'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
