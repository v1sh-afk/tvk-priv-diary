import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, X, Check } from 'lucide-react';
import type { StickyNote, StickyNoteColor, UserIdentity } from '@/types';
import { createNote, updateNote, deleteNote } from '@/services/sticky-notes/stickyNoteService';
import { relativeTime } from '@/utils/time';

type Props = {
  notes: StickyNote[];
  identity: UserIdentity;
  onChanged: () => void;
  compact?: boolean;
};

const COLORS: { id: StickyNoteColor; label: string; bg: string; border: string }[] = [
  { id: 'pink', label: 'PINK', bg: 'bg-note-pink', border: 'border-rose-300/40' },
  { id: 'lavender', label: 'LAV', bg: 'bg-note-lavender', border: 'border-purple-300/40' },
  { id: 'cyan', label: 'CYAN', bg: 'bg-note-cyan', border: 'border-cyan-300/40' },
  { id: 'yellow', label: 'YELLOW', bg: 'bg-note-yellow', border: 'border-amber-300/40' },
];

const colorClasses = (c: StickyNoteColor) =>
  COLORS.find((x) => x.id === c) ?? COLORS[0];

export default function StickyNoteBoard({ notes, identity, onChanged, compact = false }: Props) {
  const [showComposer, setShowComposer] = useState(false);
  const [draftContent, setDraftContent] = useState('');
  const [draftColor, setDraftColor] = useState<StickyNoteColor>('pink');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [editColor, setEditColor] = useState<StickyNoteColor>('pink');
  const [saving, setSaving] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const editRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (editingId && editRef.current) editRef.current.focus();
  }, [editingId]);

  const handleCreate = async () => {
    if (!draftContent.trim()) return;
    setSaving(true);
    try {
      await createNote({ content: draftContent.trim(), color: draftColor, author_identity: identity });
      setDraftContent('');
      setDraftColor('pink');
      setShowComposer(false);
      onChanged();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (note: StickyNote) => {
    setEditingId(note.id);
    setEditContent(note.content);
    setEditColor(note.color);
  };

  const handleUpdate = async () => {
    if (!editingId || !editContent.trim()) return;
    setSaving(true);
    try {
      await updateNote(editingId, { content: editContent.trim(), color: editColor });
      setEditingId(null);
      onChanged();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteNote(id);
      setConfirmDeleteId(null);
      onChanged();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className={!compact ? 'bg-navy/70 backdrop-blur-md border border-cyan-glow/20 pixel-border p-4 sm:p-5' : ''}>
      <div className="flex items-center justify-between mb-4 gap-2">
        <h2 className="font-arcade text-[0.65rem] sm:text-[0.75rem] text-ink">PINBOARD</h2>
        <button
          onClick={() => setShowComposer((s) => !s)}
          className="flex items-center gap-1.5 font-arcade text-[0.5rem] px-2 py-1.5 border border-coral/50 text-coral hover:bg-coral/10 transition-colors"
        >
          <Plus size={12} /> NOTE
        </button>
      </div>

      {/* Composer */}
      <AnimatePresence>
        {showComposer && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 overflow-hidden"
          >
            <div className={`p-3 ${colorClasses(draftColor).bg} ${colorClasses(draftColor).border} border-2`}>
              <textarea
                value={draftContent}
                onChange={(e) => setDraftContent(e.target.value)}
                placeholder="Write a note…"
                rows={3}
                className="w-full bg-transparent text-sm text-navy-deep outline-none placeholder:text-navy/50 resize-none"
                autoFocus
              />
              <div className="flex items-center justify-between mt-2 gap-2">
                <div className="flex items-center gap-1">
                  {COLORS.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setDraftColor(c.id)}
                      className={`w-5 h-5 ${c.bg} border-2 ${
                        draftColor === c.id ? 'border-navy-deep' : 'border-transparent'
                      }`}
                      aria-label={c.label}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => { setShowComposer(false); setDraftContent(''); }}
                    className="p-1 text-navy-deep/60 hover:text-navy-deep"
                    aria-label="Cancel"
                  >
                    <X size={14} />
                  </button>
                  <button
                    onClick={handleCreate}
                    disabled={saving || !draftContent.trim()}
                    className="flex items-center gap-1 font-arcade text-[0.5rem] px-2 py-1 bg-navy-deep text-cyan-glow disabled:opacity-40"
                  >
                    <Check size={11} /> PIN
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notes */}
      {notes.length === 0 && !showComposer && (
        <p className="text-sm text-muted italic text-center py-6">
          The pinboard is empty. Pin a note to get started.
        </p>
      )}

      <div className={`grid gap-3 ${compact ? '' : 'sm:grid-cols-2'}`}>
        {notes.map((note, i) => {
          const cc = colorClasses(note.color);
          const editing = editingId === note.id;
          const rotate = (i % 3) - 1; // -1, 0, 1 degrees for organic feel
          return (
            <motion.div
              key={note.id}
              layout
              initial={{ opacity: 0, scale: 0.9, rotate: rotate }}
              animate={{ opacity: 1, scale: 1, rotate }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              className={`relative p-3 ${cc.bg} ${cc.border} border-2 shadow-md`}
              style={{ transform: `rotate(${rotate}deg)` }}
            >
              {editing ? (
                <>
                  <textarea
                    ref={editRef}
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows={3}
                    className="w-full bg-transparent text-sm text-navy-deep outline-none resize-none"
                  />
                  <div className="flex items-center justify-between mt-2 gap-2">
                    <div className="flex items-center gap-1">
                      {COLORS.map((c) => (
                        <button
                          key={c.id}
                          onClick={() => setEditColor(c.id)}
                          className={`w-4 h-4 ${c.bg} border-2 ${
                            editColor === c.id ? 'border-navy-deep' : 'border-transparent'
                          }`}
                          aria-label={c.label}
                        />
                      ))}
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setEditingId(null)}
                        className="p-1 text-navy-deep/60 hover:text-navy-deep"
                        aria-label="Cancel"
                      >
                        <X size={12} />
                      </button>
                      <button
                        onClick={handleUpdate}
                        disabled={saving}
                        className="font-arcade text-[0.45rem] px-2 py-1 bg-navy-deep text-cyan-glow"
                      >
                        SAVE
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-sm text-navy-deep whitespace-pre-wrap leading-relaxed pr-4">
                    {note.content}
                  </p>
                  <div className="mt-2 flex items-center justify-between text-[0.6rem] text-navy-deep/70">
                    <span>
                      <span className="font-arcade text-[0.45rem]">{note.author_identity}</span>
                      {' · '}{relativeTime(note.updated_at)}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => startEdit(note)}
                        className="p-1 hover:text-navy-deep"
                        aria-label="Edit note"
                      >
                        <Plus size={11} className="rotate-45" />
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(note.id)}
                        className="p-1 hover:text-rose-600"
                        aria-label="Delete note"
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  </div>

                  {confirmDeleteId === note.id && (
                    <div className="absolute inset-0 grid place-items-center bg-navy-deep/80">
                      <div className="text-center text-cyan-glow">
                        <p className="text-[0.65rem] mb-2">Remove note?</p>
                        <div className="flex items-center gap-2 justify-center">
                          <button
                            onClick={() => handleDelete(note.id)}
                            className="font-arcade text-[0.5rem] px-2 py-1 border border-coral text-coral"
                          >
                            YES
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            className="font-arcade text-[0.5rem] px-2 py-1 border border-cyan-glow text-cyan-glow"
                          >
                            NO
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
