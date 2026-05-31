export type Team = 'A' | 'R' | 'N' | 'X';

export interface Card {
  id: string;
  word: string;
  team: Team;
  revealed: boolean;
}
