export interface Exercise {
  id: string;
  name: string;
  time: number; // in seconds
}

export type TimerState = "setup" | "running" | "paused" | "finished";
