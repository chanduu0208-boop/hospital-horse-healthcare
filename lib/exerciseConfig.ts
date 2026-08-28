import { ExerciseStatus } from "./types";

export const EXERCISE_LIST: ExerciseStatus[] = [
  "引き運動",
  "完全舎飼い",
  "サンシャインパドック",
];

// カードに表示するバッジの色設定（全種類同じ色）
const BASE = { bg: "bg-violet-50", text: "text-violet-700", border: "border-violet-200", dot: "bg-violet-400" };

export const EXERCISE_STYLE: Record<
  ExerciseStatus,
  { bg: string; text: string; border: string; dot: string }
> = {
  引き運動:             BASE,
  完全舎飼い:           BASE,
  サンシャインパドック: BASE,
};
