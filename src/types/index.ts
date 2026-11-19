export type UserIdentity = 'V' | 'T';

export type AllowedUser = {
  uid: string;
  username: string;
  display_identity: UserIdentity;
  created_at: string;
};

export type DiaryEntry = {
  id: string;
  title: string;
  content: string;
  entry_date: string;
  author_uid: string;
  author_identity: UserIdentity;
  created_at: string;
  updated_at: string;
};

export type NewDiaryEntry = {
  title: string;
  content: string;
  entry_date: string;
  author_identity: UserIdentity;
};

export type StickyNote = {
  id: string;
  content: string;
  color: StickyNoteColor;
  author_uid: string;
  author_identity: UserIdentity;
  created_at: string;
  updated_at: string;
};

export type NewStickyNote = {
  content: string;
  color: StickyNoteColor;
  author_identity: UserIdentity;
};

export type StickyNoteColor = 'pink' | 'lavender' | 'cyan' | 'yellow';

export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';

export type AppView = 'home' | 'memories' | 'pinboard' | 'settings';
