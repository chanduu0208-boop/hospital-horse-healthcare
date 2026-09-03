"use client";

import React, { useState, useEffect } from "react";
import { Plus, Check, Calendar, X, AlertCircle, CalendarDays } from "lucide-react";
import { Horse, HealthStatus, InpatientCareType, ExerciseStatus, HorseRecord, CalendarEvent, WeightRecord, TemperatureRecord, BloodTestRecord, FeedingRecord, SurgeryRecord, ExamRecord, MedicationSchedule, ExcretionRecord } from "@/lib/types";
import { sampleHorses } from "@/lib/sampleData";
import { EXERCISE_LIST, EXERCISE_STYLE } from "@/lib/exerciseConfig";
import { CARE_TYPE_STYLE } from "@/lib/careTypeConfig";
import SideDrawer from "@/components/SideDrawer";
import HorseDetail from "@/components/HorseDetail";
import CalendarView from "@/components/CalendarView";

// ============================================================
// 定数・ユーティリティ
// ============================================================

const STORAGE_KEY   = "horse-hospital-v5";
const CALENDAR_KEY  = "horse-hospital-calendar-v1";
// 旧バージョンのキー（起動時に削除）
const OLD_KEYS = ["horse-health-v1", "horse-health-v2", "horse-health-v3", "horse-health-v4"];

const VALID_STATUSES: HealthStatus[] = ["入院馬", "譲渡馬", "退院馬"];
// 旧ステータスからの読み替え（往診中・経過観察・術後入院→入院馬、健康→譲渡馬）
const LEGACY_STATUS_MAP: Record<string, HealthStatus> = {
  往診中: "入院馬",
  経過観察: "入院馬",
  術後入院: "入院馬",
  健康: "譲渡馬",
};
function resolveStatus(v: unknown): HealthStatus {
  if (typeof v === "string" && VALID_STATUSES.includes(v as HealthStatus)) return v as HealthStatus;
  if (typeof v === "string" && LEGACY_STATUS_MAP[v]) return LEGACY_STATUS_MAP[v];
  return "入院馬";
}

// 旧運動状況からの読み替え
const LEGACY_EXERCISE_MAP: Record<string, ExerciseStatus> = {
  舎飼い: "完全舎飼い",
  曳き運動: "引き運動",
  中間: "引き運動",
  丸パ: "サンシャインパドック",
  パドック: "サンシャインパドック",
  日中時間制限: "サンシャインパドック",
  日中フル: "サンシャインパドック",
  夜間放牧: "サンシャインパドック",
};
function resolveExercise(v: unknown): ExerciseStatus {
  if (typeof v === "string" && (EXERCISE_LIST as string[]).includes(v)) return v as ExerciseStatus;
  if (typeof v === "string" && LEGACY_EXERCISE_MAP[v]) return LEGACY_EXERCISE_MAP[v];
  return "完全舎飼い";
}

// 旧データを現在の型に合わせて補完する
function migrateHorse(h: Record<string, unknown>): Horse {
  return {
    id: (h.id as string) ?? generateId(),
    name: (h.name as string) ?? "不明",
    status: resolveStatus(h.status),
    careType: h.careType as InpatientCareType | undefined,
    exercise: resolveExercise(h.exercise),
    firstVisitDate: (h.firstVisitDate as string) ?? getToday(),
    dischargeDate: h.dischargeDate as string | undefined,
    diagnosis: (h.diagnosis as string) ?? "なし",
    visitCheckedDate: h.visitCheckedDate as string | undefined,
    archived: h.archived as boolean | undefined,
    fluidTherapy: h.fluidTherapy as boolean | undefined,
    fluidRate: h.fluidRate as string | undefined,
    pastHistory: h.pastHistory as string | undefined,
    notes: h.notes as string | undefined,
    weightRecords: Array.isArray(h.weightRecords) ? (h.weightRecords as WeightRecord[]) : [],
    temperatureRecords: Array.isArray(h.temperatureRecords) ? (h.temperatureRecords as TemperatureRecord[]) : [],
    bloodTestRecords: Array.isArray(h.bloodTestRecords) ? (h.bloodTestRecords as BloodTestRecord[]) : [],
    feedingRecords: Array.isArray(h.feedingRecords) ? (h.feedingRecords as FeedingRecord[]) : [],
    surgeryRecords: Array.isArray(h.surgeryRecords) ? (h.surgeryRecords as SurgeryRecord[]) : [],
    examRecords: Array.isArray(h.examRecords) ? (h.examRecords as ExamRecord[]) : [],
    medicationSchedules: Array.isArray(h.medicationSchedules) ? (h.medicationSchedules as MedicationSchedule[]) : [],
    excretionRecords: Array.isArray(h.excretionRecords) ? (h.excretionRecords as ExcretionRecord[]) : [],
    // records がなければ healthRecords / treatmentRecords から変換
    records: (() => {
      if (Array.isArray(h.records)) {
        // 旧スキーマの type フィールドが残っていても無視する
        return (h.records as Record<string, unknown>[]).map((r) => ({
          id: r.id as string,
          date: r.date as string,
          condition: r.condition as string,
          notes: r.notes as string | undefined,
          veterinarian: r.veterinarian as string | undefined,
          treatment: r.treatment as string | undefined,
          medication: r.medication as string | undefined,
        })) as Horse["records"];
      }
      const legacy: Horse["records"] = [];
      if (Array.isArray(h.healthRecords)) {
        (h.healthRecords as Record<string, unknown>[]).forEach((r) => {
          legacy.push({ id: r.id as string, date: r.date as string, condition: r.condition as string, notes: r.notes as string | undefined });
        });
      }
      if (Array.isArray(h.treatmentRecords)) {
        (h.treatmentRecords as Record<string, unknown>[]).forEach((r) => {
          legacy.push({ id: r.id as string, date: r.date as string, condition: r.treatment as string ?? "", veterinarian: r.veterinarian as string | undefined, treatment: r.treatment as string | undefined, medication: r.medication as string | undefined, notes: r.notes as string | undefined });
        });
      }
      return legacy.sort((a, b) => b.date.localeCompare(a.date));
    })(),
  };
}

function getToday(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatDate(d: string): string {
  if (!d) return "";
  const [y, m, day] = d.split("-");
  return `${y}/${m}/${day}`;
}

function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
}

const TAB_COLORS: Record<HealthStatus, { dot: string; active: string }> = {
  入院馬: { dot: "bg-red-400",     active: "text-red-600" },
  譲渡馬:   { dot: "bg-emerald-400", active: "text-emerald-600" },
  退院馬:   { dot: "bg-slate-400",   active: "text-slate-600" },
};

const STATUS_CARD_BAR: Record<HealthStatus, string> = {
  入院馬: "bg-gradient-to-b from-red-300 to-red-500",
  譲渡馬:   "bg-gradient-to-b from-emerald-300 to-emerald-500",
  退院馬:   "bg-gradient-to-b from-slate-300 to-slate-500",
};

// 入院馬は区分（内科／様子見）が設定されていればその色、未設定なら通常の赤系
function getCardBarClass(horse: Horse): string {
  if (horse.status === "入院馬" && horse.careType) {
    const s = CARE_TYPE_STYLE[horse.careType];
    return `bg-gradient-to-b ${s.barFrom} ${s.barTo}`;
  }
  return STATUS_CARD_BAR[horse.status];
}

// ============================================================
// 運動バッジ
// ============================================================

function ExerciseBadge({ exercise }: { exercise: ExerciseStatus }) {
  const s = EXERCISE_STYLE[exercise];
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full border flex-shrink-0 ${s.bg} ${s.text} ${s.border}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${s.dot}`} />
      {exercise}
    </span>
  );
}

// ============================================================
// 馬カード
// ============================================================

function HorseCard({
  horse,
  onTap,
  showVisitCheck,
  onToggleVisit,
}: {
  horse: Horse;
  onTap: () => void;
  showVisitCheck?: boolean;
  onToggleVisit?: () => void;
}) {
  const today = getToday();
  const isChecked = horse.visitCheckedDate === today;

  return (
    <div className="rounded-2xl shadow-sm mb-3 overflow-hidden flex flex-col hover:shadow-md transition-shadow border border-gray-100 bg-white">
      <div className="flex items-stretch">
        {/* ステータスカラーバー（左側） */}
        <div className={`w-1.5 flex-shrink-0 ${getCardBarClass(horse)}`} />

        {/* メインコンテンツ */}
        <div className="flex-1 p-3.5 cursor-pointer min-w-0 active:bg-gray-50" onClick={onTap}>
          {/* 1行目：馬名 + 運動バッジ */}
          <div className="flex items-center gap-2 mb-1.5">
            <span className="font-bold text-base text-gray-900 flex-1 min-w-0 leading-snug">
              {horse.name}
            </span>
            {horse.status === "入院馬" && horse.careType && (
              <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full border flex-shrink-0 ${CARE_TYPE_STYLE[horse.careType].badge}`}>
                {horse.careType}
              </span>
            )}
            <ExerciseBadge exercise={horse.exercise} />
          </div>

          {/* 2行目：入院日 */}
          <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
            <Calendar size={11} className="flex-shrink-0" />
            <span>入院 {formatDate(horse.firstVisitDate)}</span>
          </div>

          {/* 3行目：診断名 */}
          <div className="text-sm font-medium text-gray-700 truncate">
            {horse.diagnosis && horse.diagnosis !== "なし" ? (
              horse.diagnosis
            ) : (
              <span className="text-gray-400 font-normal">診断名なし</span>
            )}
          </div>
        </div>

        {/* 本日確認チェック（入院馬タブのみ） */}
        {showVisitCheck && (
          <div className="flex flex-col items-center justify-center px-3.5 gap-1 border-l border-gray-50">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleVisit?.();
              }}
              className={`w-11 h-11 rounded-full border-2 flex items-center justify-center transition-all duration-200 active:scale-90 ${
                isChecked
                  ? "bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-200"
                  : "border-gray-300 text-transparent hover:border-emerald-300 hover:bg-emerald-50"
              }`}
            >
              <Check size={20} strokeWidth={2.5} />
            </button>
            <span className={`text-xs font-medium ${isChecked ? "text-emerald-600" : "text-gray-400"}`}>
              {isChecked ? "済み" : "確認"}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// 運動状況セレクター（フォーム共通）
// ============================================================

function ExerciseSelector({
  value,
  onChange,
}: {
  value: ExerciseStatus;
  onChange: (v: ExerciseStatus) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {EXERCISE_LIST.map((ex) => {
        const s = EXERCISE_STYLE[ex];
        const selected = value === ex;
        return (
          <button
            key={ex}
            type="button"
            onClick={() => onChange(ex)}
            className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-left transition-all ${
              selected
                ? `${s.bg} ${s.border} ${s.text}`
                : "bg-white border-gray-200 text-gray-500 hover:border-gray-300"
            }`}
          >
            <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${selected ? s.dot : "bg-gray-300"}`} />
            <span className="text-sm font-medium truncate">{ex}</span>
            {selected && <span className="ml-auto text-xs">✓</span>}
          </button>
        );
      })}
    </div>
  );
}

// ============================================================
// 確認後すぐ履歴追加モーダル
// ============================================================

function QuickRecordModal({
  horse,
  onSave,
  onClose,
}: {
  horse: Horse;
  onSave: (record: Omit<HorseRecord, "id">) => void;
  onClose: () => void;
}) {
  const [date, setDate] = useState(getToday());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [condition, setCondition] = useState("");
  const [veterinarian, setVeterinarian] = useState("");
  const [treatment, setTreatment] = useState("");
  const [medication, setMedication] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!condition.trim()) { setError("体調・状態を入力してください。"); return; }
    onSave({
      date,
      condition: condition.trim(),
      veterinarian: veterinarian.trim() || undefined,
      treatment: treatment.trim() || undefined,
      medication: medication.trim() || undefined,
      notes: notes.trim() || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end overflow-hidden">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-t-2xl shadow-2xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* ヘッダー */}
        <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-gray-100 flex-shrink-0">
          <div>
            <h3 className="font-bold text-gray-800 text-base">履歴を追加</h3>
            <p className="text-xs text-gray-400 mt-0.5">{horse.name}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100">
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        <div className="overflow-y-auto overflow-x-hidden p-4 pb-10">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg p-3">
                <AlertCircle size={15} className="text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* 日付 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">日付</label>
              {showDatePicker ? (
                <div className="flex items-center gap-2">
                  <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
                    className="flex-1 border border-blue-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                    required autoFocus />
                  <button type="button" onClick={() => { setDate(getToday()); setShowDatePicker(false); }}
                    className="text-xs text-blue-500 hover:text-blue-700 font-medium whitespace-nowrap px-1">
                    今日に戻す
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between border border-gray-200 rounded-xl px-3 py-2.5 bg-gray-50">
                  <div className="flex items-center gap-2">
                    <Calendar size={15} className="text-gray-400 flex-shrink-0" />
                    <span className="text-sm text-gray-700">
                      {date === getToday() ? `今日 (${formatDate(date)})` : formatDate(date)}
                    </span>
                  </div>
                  <button type="button" onClick={() => setShowDatePicker(true)}
                    className="text-xs text-blue-500 hover:text-blue-700 font-medium">
                    変更
                  </button>
                </div>
              )}
            </div>

            {/* 体調・状態 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                体調・状態 <span className="text-red-500">*</span>
              </label>
              <input type="text" value={condition}
                onChange={(e) => { setCondition(e.target.value); setError(""); }}
                placeholder="例：跛行あり、食欲良好、落ち着いている"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
            </div>

            {/* 処置内容 */}
            <div className="space-y-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
              <p className="text-xs font-semibold text-blue-600">処置内容（任意）</p>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">担当獣医師</label>
                <input type="text" value={veterinarian} onChange={(e) => setVeterinarian(e.target.value)}
                  placeholder="例：山田獣医師"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-300" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">処置内容</label>
                <input type="text" value={treatment} onChange={(e) => setTreatment(e.target.value)}
                  placeholder="例：消炎剤投与・冷却療法"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-300" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">薬剤・投薬</label>
                <input type="text" value={medication} onChange={(e) => setMedication(e.target.value)}
                  placeholder="例：フェニルブタゾン 4g"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-300" />
              </div>
            </div>

            {/* メモ */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">メモ</label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
                placeholder="指示事項・注意点など"
                rows={2}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none" />
            </div>

            {/* ボタン */}
            <div className="flex gap-2 pt-1">
              <button type="button" onClick={onClose}
                className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">
                スキップ
              </button>
              <button type="submit"
                className="flex-1 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 shadow-md shadow-blue-200">
                保存
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// 馬追加フォーム（モーダル）
// ============================================================

const STATUS_ADD_STYLE: Record<HealthStatus, { sel: string; badge: string }> = {
  入院馬: { sel: "border-red-400 bg-red-50", badge: "bg-red-100 text-red-700 border-red-200" },
  譲渡馬:   { sel: "border-emerald-400 bg-emerald-50", badge: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  退院馬:   { sel: "border-slate-400 bg-slate-50", badge: "bg-slate-100 text-slate-700 border-slate-200" },
};

function AddHorseModal({
  onSave,
  onClose,
  initialStatus = "入院馬",
}: {
  onSave: (data: Omit<Horse, "id" | "records">) => void;
  onClose: () => void;
  initialStatus?: HealthStatus;
}) {
  const [name, setName] = useState("");
  const [status, setStatus] = useState<HealthStatus>(initialStatus);
  const [careType, setCareType] = useState<InpatientCareType | "">("");
  const [exercise, setExercise] = useState<ExerciseStatus>("完全舎飼い");
  const [firstVisitDate, setFirstVisitDate] = useState(getToday());
  const [diagnosis, setDiagnosis] = useState("");
  const [pastHistory, setPastHistory] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError("馬名を入力してください。"); return; }
    onSave({
      name: name.trim(),
      status,
      careType: status === "入院馬" ? (careType || undefined) : undefined,
      exercise,
      firstVisitDate,
      diagnosis: diagnosis.trim() || "なし",
      pastHistory: pastHistory.trim() || undefined,
      notes: notes.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end overflow-hidden">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-t-2xl shadow-2xl max-h-[92vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-gray-100 flex-shrink-0">
          <h3 className="font-bold text-gray-800 text-base">馬を新規追加</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100">
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        <div className="overflow-y-auto overflow-x-hidden p-4 pb-10">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg p-3">
                <AlertCircle size={15} className="text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* 馬名 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                馬名 <span className="text-red-500">*</span>
              </label>
              <input type="text" value={name}
                onChange={(e) => { setName(e.target.value); setError(""); }}
                placeholder="例：サンライズスター"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
            </div>

            {/* ステータス */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">ステータス</label>
              <div className="flex gap-2">
                {(["入院馬", "譲渡馬", "退院馬"] as HealthStatus[]).map((s) => (
                  <label key={s} className={`flex-1 flex justify-center cursor-pointer py-2 rounded-xl border-2 transition-all ${status === s ? STATUS_ADD_STYLE[s].sel : "border-gray-200"}`}>
                    <input type="radio" value={s} checked={status === s} onChange={() => setStatus(s)} className="sr-only" />
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${STATUS_ADD_STYLE[s].badge}`}>{s}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 区分（内科／様子見） */}
            {status === "入院馬" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">区分（内科／様子見）</label>
                <div className="flex gap-2">
                  {(["内科", "様子見"] as InpatientCareType[]).map((c) => (
                    <button key={c} type="button" onClick={() => setCareType((v) => (v === c ? "" : c))}
                      className={`flex-1 py-2 rounded-xl border-2 text-sm font-bold transition-all ${
                        careType === c ? CARE_TYPE_STYLE[c].select : "border-gray-200 text-gray-500 hover:border-gray-300"
                      }`}>
                      {c}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-1">手術をせず経過観察のみの場合は「様子見」を選択してください（任意）。</p>
              </div>
            )}

            {/* 運動状況 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">運動状況</label>
              <ExerciseSelector value={exercise} onChange={setExercise} />
            </div>

            {/* 入院日 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                入院日 <span className="text-red-500">*</span>
              </label>
              <input type="date" value={firstVisitDate} onChange={(e) => setFirstVisitDate(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" required />
            </div>

            {/* 診断名 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">診断名</label>
              <input type="text" value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)}
                placeholder="例：右前脚跛行（なしの場合は空欄）"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
            </div>

            {/* 既往歴 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">既往歴</label>
              <textarea value={pastHistory} onChange={(e) => setPastHistory(e.target.value)}
                placeholder="過去の病歴・手術歴・特記事項など（任意）" rows={3}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none" />
            </div>

            {/* メモ */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">メモ・注意事項</label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
                placeholder="管理上の注意点など（任意）" rows={3}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none" />
            </div>

            {/* ボタン */}
            <div className="flex gap-2 pt-1">
              <button type="button" onClick={onClose} className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">
                キャンセル
              </button>
              <button type="submit" className="flex-1 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 shadow-md shadow-blue-200">
                追加する
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// メインページ
// ============================================================

export default function HomePage() {
  const [horses, setHorses] = useState<Horse[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState<HealthStatus>("入院馬");
  const [selectedHorseId, setSelectedHorseId] = useState<string | null>(null);
  const [showDrawer, setShowDrawer] = useState(false);
  const [showAddHorse, setShowAddHorse] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [visitRecordHorseId, setVisitRecordHorseId] = useState<string | null>(null);

  useEffect(() => {
    // 旧バージョンのデータを削除
    OLD_KEYS.forEach((k) => localStorage.removeItem(k));
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Record<string, unknown>[];
        setHorses(parsed.map(migrateHorse));
      } else {
        setHorses(sampleHorses);
      }
    } catch {
      setHorses(sampleHorses);
    }
    try {
      const storedEvents = localStorage.getItem(CALENDAR_KEY);
      if (storedEvents) {
        const parsed = JSON.parse(storedEvents) as CalendarEvent[];
        // 同じ馬・日付・タイトルの重複を除去（最初の1件を残す）
        const seen = new Set<string>();
        const deduped = parsed.filter((e) => {
          const key = `${e.horseId}|${e.date}|${e.title}`;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
        setEvents(deduped);
      }
    } catch { /* ignore */ }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) localStorage.setItem(STORAGE_KEY, JSON.stringify(horses));
  }, [horses, isLoaded]);

  useEffect(() => {
    if (isLoaded) localStorage.setItem(CALENDAR_KEY, JSON.stringify(events));
  }, [events, isLoaded]);

  const addHorse = (data: Omit<Horse, "id" | "records">) => {
    setHorses((prev) => [...prev, { ...data, id: generateId(), records: [] }]);
    setShowAddHorse(false);
    setActiveTab(data.status);
  };

  const updateHorse = (updated: Horse) => {
    setHorses((prev) => prev.map((h) => (h.id === updated.id ? updated : h)));
  };

  const addEvent    = (ev: CalendarEvent) => setEvents((prev) => [...prev, ev]);
  const deleteEvent = (id: string) => setEvents((prev) => prev.filter((e) => e.id !== id));

  const deleteHorse = (id: string) => {
    setHorses((prev) => prev.filter((h) => h.id !== id));
    setSelectedHorseId(null);
  };

  const toggleVisitCheck = (horseId: string) => {
    const today = getToday();
    const horse = horses.find((h) => h.id === horseId);
    if (!horse) return;
    const willBeChecked = horse.visitCheckedDate !== today;
    setHorses((prev) =>
      prev.map((h) =>
        h.id !== horseId ? h : { ...h, visitCheckedDate: willBeChecked ? today : undefined }
      )
    );
    // チェックON時は履歴追加モーダルを開く
    if (willBeChecked) {
      setVisitRecordHorseId(horseId);
    }
  };

  const filteredHorses = horses.filter((h) => h.status === activeTab && !h.archived);

  const sortedHorses =
    activeTab === "入院馬"
      ? [
          ...filteredHorses.filter((h) => h.visitCheckedDate !== getToday()),
          ...filteredHorses.filter((h) => h.visitCheckedDate === getToday()),
        ]
      : filteredHorses;

  const tabCounts = (["入院馬", "譲渡馬", "退院馬"] as HealthStatus[]).reduce(
    (acc, tab) => { acc[tab] = horses.filter((h) => h.status === tab && !h.archived).length; return acc; },
    {} as Record<HealthStatus, number>
  );

  const todayCheckedCount = horses.filter((h) => h.status === "入院馬" && h.visitCheckedDate === getToday()).length;
  const totalVisitCount = horses.filter((h) => h.status === "入院馬").length;

  const selectedHorse = selectedHorseId ? horses.find((h) => h.id === selectedHorseId) ?? null : null;

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-400 text-sm">読み込み中...</div>
      </div>
    );
  }

  // メインリストは常にDOMに残す（hidden で隠すだけ）→ スクロール位置が自然保持される
  const isMainHidden = showCalendar || !!selectedHorse;

  return (
    <>
      {/* カレンダービュー */}
      {showCalendar && (
        <div className="max-w-lg mx-auto min-h-screen">
          <CalendarView
            horses={horses}
            events={events}
            onAddEvent={addEvent}
            onDeleteEvent={deleteEvent}
            onBack={() => setShowCalendar(false)}
          />
        </div>
      )}

      {/* 馬詳細ビュー */}
      {selectedHorse && (
        <div className="max-w-lg mx-auto min-h-screen">
          <HorseDetail
            horse={selectedHorse}
            onBack={() => setSelectedHorseId(null)}
            onUpdate={updateHorse}
            onDelete={() => deleteHorse(selectedHorse.id)}
            onAddCalendarEvent={(title) => addEvent({
              id: generateId(),
              date: getToday(),
              horseId: selectedHorse.id,
              horseName: selectedHorse.name,
              title,
              isLog: true,
            })}
          />
        </div>
      )}

      {/* メインリスト（常にDOMに存在 - 他ビュー表示中はhidden）
          h-screen で高さを固定 → <main> が実スクロールコンテナになりscrollTopが保持される */}
      <div className={`max-w-lg mx-auto h-screen bg-gray-100 flex flex-col${isMainHidden ? " hidden" : ""}`}>
      <SideDrawer
        isOpen={showDrawer}
        onClose={() => setShowDrawer(false)}
        horses={horses}
        onSelectHorse={(id) => {
          const horse = horses.find((h) => h.id === id);
          if (horse) { setActiveTab(horse.status); setSelectedHorseId(id); }
        }}
        onDeleteHorses={(ids) => {
          setHorses((prev) => prev.filter((h) => !ids.includes(h.id)));
        }}
        onAddHorse={() => {
          setShowDrawer(false);
          setShowAddHorse(true);
        }}
      />

      {/* ヘッダー */}
      <header className="bg-white shadow-sm px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <button onClick={() => setShowDrawer(true)} className="p-2 -ml-2 rounded-xl hover:bg-gray-100 active:bg-gray-200">
          <div className="flex flex-col gap-1.5 w-5">
            <span className="block h-0.5 bg-gray-700 rounded-full" />
            <span className="block h-0.5 bg-gray-700 rounded-full" />
            <span className="block h-0.5 bg-gray-700 rounded-full" />
          </div>
        </button>
        <h1 className="font-bold text-base text-gray-800 flex-1 text-center">馬体管理</h1>
        {/* カレンダーアイコン（今後の予定があれば青ドット） */}
        <button onClick={() => setShowCalendar(true)} className="relative p-2 rounded-xl hover:bg-gray-100 active:bg-gray-200">
          <CalendarDays size={22} className="text-gray-700" />
          {events.filter((e) => e.date >= getToday()).length > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-500" />
          )}
        </button>
        <button onClick={() => setShowAddHorse(true)} className="p-2 -mr-2 rounded-xl hover:bg-gray-100 active:bg-gray-200">
          <Plus size={22} className="text-gray-700" />
        </button>
      </header>

      {/* 本日の確認バナー */}
      {activeTab === "入院馬" && totalVisitCount > 0 && (
        <div className={`mx-4 mt-3 mb-1 px-4 py-2.5 rounded-xl flex items-center justify-between ${
          todayCheckedCount === totalVisitCount ? "bg-emerald-50 border border-emerald-200" : "bg-blue-50 border border-blue-100"
        }`}>
          <span className="text-sm font-medium text-gray-700">本日の確認</span>
          <span className={`text-sm font-bold ${todayCheckedCount === totalVisitCount ? "text-emerald-600" : "text-blue-600"}`}>
            {todayCheckedCount} / {totalVisitCount} 完了{todayCheckedCount === totalVisitCount && " ✓"}
          </span>
        </div>
      )}

      {/* リスト */}
      <main className="flex-1 overflow-y-auto px-4 pt-3 pb-28">
        {sortedHorses.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🐴</div>
            <p className="text-gray-500 font-medium mb-1">{activeTab}の馬がいません</p>
            <p className="text-gray-400 text-sm">「+」ボタンで馬を追加できます</p>
          </div>
        ) : (
          <>
            {activeTab === "入院馬" && (() => {
              const unchecked = sortedHorses.filter((h) => h.visitCheckedDate !== getToday());
              const checked   = sortedHorses.filter((h) => h.visitCheckedDate === getToday());
              return (
                <>
                  {unchecked.length > 0 && (
                    <>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 ml-1">未確認 ({unchecked.length}頭)</p>
                      {unchecked.map((horse) => (
                        <HorseCard key={horse.id} horse={horse} onTap={() => setSelectedHorseId(horse.id)} showVisitCheck onToggleVisit={() => toggleVisitCheck(horse.id)} />
                      ))}
                    </>
                  )}
                  {checked.length > 0 && (
                    <>
                      <p className="text-xs font-semibold text-emerald-500 uppercase tracking-wide mb-2 ml-1 mt-4">確認済み ({checked.length}頭)</p>
                      {checked.map((horse) => (
                        <div key={horse.id} className="opacity-60">
                          <HorseCard horse={horse} onTap={() => setSelectedHorseId(horse.id)} showVisitCheck onToggleVisit={() => toggleVisitCheck(horse.id)} />
                        </div>
                      ))}
                    </>
                  )}
                </>
              );
            })()}
            {activeTab !== "入院馬" && sortedHorses.map((horse) => (
              <HorseCard key={horse.id} horse={horse} onTap={() => setSelectedHorseId(horse.id)} />
            ))}
          </>
        )}
      </main>

      {/* ボトムタブ */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-white border-t border-gray-200 shadow-lg">
        <div className="flex">
          {(["入院馬", "譲渡馬", "退院馬"] as HealthStatus[]).map((tab) => {
            const isActive = activeTab === tab;
            const colors = TAB_COLORS[tab];
            return (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3 flex flex-col items-center gap-0.5 transition-colors relative ${isActive ? "text-gray-900" : "text-gray-400 hover:text-gray-600"}`}>
                {isActive && <span className={`absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full ${colors.dot}`} />}
                <span className={`w-2 h-2 rounded-full transition-all ${colors.dot} ${isActive ? "opacity-100 scale-110" : "opacity-30"}`} />
                <span className={`text-xs font-semibold ${isActive ? colors.active : "text-gray-400"}`}>{tab}</span>
                <span className={`text-xs ${isActive ? "text-gray-600 font-bold" : "text-gray-300"}`}>{tabCounts[tab]}頭</span>
              </button>
            );
          })}
        </div>
      </nav>

      {showAddHorse && <AddHorseModal initialStatus={activeTab} onSave={addHorse} onClose={() => setShowAddHorse(false)} />}
      {visitRecordHorseId && (() => {
        const horse = horses.find((h) => h.id === visitRecordHorseId);
        if (!horse) return null;
        return (
          <QuickRecordModal
            horse={horse}
            onSave={(record) => {
              updateHorse({
                ...horse,
                records: [{ ...record, id: `${Date.now()}_${Math.random().toString(36).substr(2, 8)}` }, ...horse.records]
                  .sort((a, b) => b.date.localeCompare(a.date)),
              });
              setVisitRecordHorseId(null);
            }}
            onClose={() => setVisitRecordHorseId(null)}
          />
        );
      })()}
      </div>
    </>
  );
}
