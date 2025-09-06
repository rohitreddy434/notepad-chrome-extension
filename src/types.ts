export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  todos: Todo[];
  createdAt: Date;
  updatedAt: Date;
}

export interface NoteCreateInput {
  title?: string;
  content?: string;
  todos?: Todo[];
}
