export interface Profile {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface Column {
  id: string;
  name: string;
  position: number;
  color: string;
  created_at: string;
}

export interface Idea {
  id: string;
  title: string;
  description?: string;
  creator_id: string;
  column_id: string;
  position_in_column: number;
  created_at: string;
  updated_at: string;
  creator?: Profile;
  votes?: Vote[];
  comments?: Comment[];
  vote_count?: number;
  comment_count?: number;
  user_has_voted?: boolean;
}

export interface Vote {
  id: string;
  user_id: string;
  idea_id: string;
  created_at: string;
  user?: Profile;
}

export interface Comment {
  id: string;
  content: string;
  user_id: string;
  idea_id: string;
  created_at: string;
  updated_at: string;
  user?: Profile;
}