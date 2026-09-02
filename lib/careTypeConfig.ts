import { InpatientCareType } from "./types";

// 入院馬の区分（内科／様子見）ごとの色。未設定（振り分け前・術後管理など）は
// 呼び出し側で赤系のデフォルト色にフォールバックする。
export const CARE_TYPE_STYLE: Record<InpatientCareType, { badge: string; select: string; barFrom: string; barTo: string }> = {
  内科: { badge: "bg-amber-50 text-amber-700 border-amber-200", select: "border-amber-400 bg-amber-50 text-amber-700", barFrom: "from-amber-300", barTo: "to-amber-500" },
  様子見: { badge: "bg-sky-50 text-sky-700 border-sky-200", select: "border-sky-400 bg-sky-50 text-sky-700", barFrom: "from-sky-300", barTo: "to-sky-500" },
};
