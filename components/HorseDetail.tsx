"use client";

import React, { useState } from "react";
import {
  ChevronLeft,
  Edit2,
  Trash2,
  Plus,
  X,
  ChevronDown,
  ChevronUp,
  Calendar,
  FileText,
  Activity,
  AlertCircle,
  BookOpen,
  Scale,
  Camera,
  Thermometer,
  Utensils,
  Droplet,
  Scissors,
  FlaskConical,
  LogOut,
  Droplets,
} from "lucide-react";
import { Horse, HealthStatus, InpatientCareType, HorseRecord, ExerciseStatus, WeightRecord, WeightSession, TemperatureRecord, FeedingRecord, SurgeryRecord, ExamRecord, ExamType, ExcretionRecord } from "@/lib/types";
import { EXERCISE_LIST, EXERCISE_STYLE } from "@/lib/exerciseConfig";
import PhotoCapture from "./PhotoCapture";
import BloodTestSection from "./BloodTestSection";
import MedicationSection from "./MedicationSection";

const EXAM_TYPES: { key: ExamType; label: string; calendarTitle: string }[] = [
  { key: "US", label: "US", calendarTitle: "エコー検査" },
  { key: "X-ray", label: "X-ray", calendarTitle: "レントゲン撮影" },
  { key: "その他", label: "その他", calendarTitle: "その他" },
];

// 運動バッジ（詳細画面用）
function ExerciseBadge({ exercise }: { exercise: ExerciseStatus }) {
  const s = EXERCISE_STYLE[exercise];
  return (
    <span className={`inline-flex items-center gap-1.5 text-sm font-bold px-2.5 py-1 rounded-full border ${s.bg} ${s.text} ${s.border}`}>
      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${s.dot}`} />
      {exercise}
    </span>
  );
}

// 運動状況セレクター
function ExerciseSelector({ value, onChange }: { value: ExerciseStatus; onChange: (v: ExerciseStatus) => void }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {EXERCISE_LIST.map((ex) => {
        const s = EXERCISE_STYLE[ex];
        const selected = value === ex;
        return (
          <button key={ex} type="button" onClick={() => onChange(ex)}
            className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-left transition-all ${selected ? `${s.bg} ${s.border} ${s.text}` : "bg-white border-gray-200 text-gray-500 hover:border-gray-300"}`}>
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
// ユーティリティ
// ============================================================

function formatDate(d: string) {
  if (!d) return "";
  const [y, m, day] = d.split("-");
  return `${y}/${m}/${day}`;
}

function formatShortDate(d: string) {
  if (!d) return "";
  const [, m, day] = d.split("-");
  return `${parseInt(m)}/${parseInt(day)}`;
}

function generateId() {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
}

function getToday() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// ============================================================
// 履歴追加フォーム
// ============================================================

interface RecordFormProps {
  initialRecord?: HorseRecord; // 指定時は編集モード
  onSave: (record: Omit<HorseRecord, "id">) => void;
  onClose: () => void;
}

function RecordForm({ initialRecord, onSave, onClose }: RecordFormProps) {
  const isEdit = !!initialRecord;
  const [date, setDate] = useState(initialRecord?.date ?? getToday());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [condition, setCondition] = useState(initialRecord?.condition ?? "");
  const [veterinarian, setVeterinarian] = useState(initialRecord?.veterinarian ?? "");
  const [treatment, setTreatment] = useState(initialRecord?.treatment ?? "");
  const [medication, setMedication] = useState(initialRecord?.medication ?? "");
  const [notes, setNotes] = useState(initialRecord?.notes ?? "");
  const [showPhoto, setShowPhoto] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!condition.trim()) return;
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
          <h3 className="font-bold text-gray-800 text-base">{isEdit ? "履歴を編集" : "履歴を追加"}</h3>
          <div className="flex items-center gap-1">
            {!isEdit && (
              <button type="button" onClick={() => setShowPhoto(true)}
                className="flex items-center gap-1 text-xs text-violet-600 font-medium bg-violet-50 hover:bg-violet-100 px-2 py-1.5 rounded-lg transition-colors mr-1">
                <Camera size={13} />
                写真から入力
              </button>
            )}
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100">
              <X size={18} className="text-gray-500" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto overflow-x-hidden p-4 pb-10">
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* 日付 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">日付</label>
              {showDatePicker ? (
                /* 日付変更モード */
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="flex-1 border border-blue-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                    required
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => { setDate(getToday()); setShowDatePicker(false); }}
                    className="text-xs text-blue-500 hover:text-blue-700 font-medium whitespace-nowrap px-1"
                  >
                    今日に戻す
                  </button>
                </div>
              ) : (
                /* 通常表示：今日が自動セット済み */
                <div className="flex items-center justify-between border border-gray-200 rounded-xl px-3 py-2.5 bg-gray-50">
                  <div className="flex items-center gap-2">
                    <Calendar size={15} className="text-gray-400 flex-shrink-0" />
                    <span className="text-sm text-gray-700">
                      {date === getToday()
                        ? `今日 (${formatDate(date)})`
                        : formatDate(date)}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowDatePicker(true)}
                    className="text-xs text-blue-500 hover:text-blue-700 font-medium"
                  >
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
              <input
                type="text"
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                placeholder="例：跛行あり、食欲良好、落ち着いている"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                required
              />
            </div>

            {/* 獣医師・処置・薬剤 */}
            <div className="space-y-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
              <p className="text-xs font-semibold text-blue-600">処置内容（任意）</p>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  担当獣医師
                </label>
                <input
                  type="text"
                  value={veterinarian}
                  onChange={(e) => setVeterinarian(e.target.value)}
                  placeholder="例：山田獣医師"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  処置内容
                </label>
                <input
                  type="text"
                  value={treatment}
                  onChange={(e) => setTreatment(e.target.value)}
                  placeholder="例：消炎剤投与・冷却療法"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  薬剤・投薬
                </label>
                <input
                  type="text"
                  value={medication}
                  onChange={(e) => setMedication(e.target.value)}
                  placeholder="例：フェニルブタゾン 4g"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
              </div>
            </div>

            {/* メモ */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">メモ</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="指示事項・注意点など"
                rows={3}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
              />
            </div>

            {/* ボタン */}
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                キャンセル
              </button>
              <button
                type="submit"
                className="flex-1 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 shadow-md shadow-blue-200"
              >
                {isEdit ? "更新" : "保存"}
              </button>
            </div>
          </form>
        </div>
      </div>
      {showPhoto && (
        <PhotoCapture
          kind="treatment"
          title="履歴を写真から自動入力"
          onClose={() => setShowPhoto(false)}
          onExtracted={(result) => {
            if (typeof result.date === "string") setDate(result.date);
            if (typeof result.condition === "string") setCondition(result.condition);
            if (typeof result.veterinarian === "string") setVeterinarian(result.veterinarian);
            if (typeof result.treatment === "string") setTreatment(result.treatment);
            if (typeof result.medication === "string") setMedication(result.medication);
            if (typeof result.notes === "string") setNotes(result.notes);
            setShowPhoto(false);
          }}
        />
      )}
    </div>
  );
}

// ============================================================
// 体重記録フォーム
// ============================================================

interface WeightFormProps {
  onSave: (wr: Omit<WeightRecord, "id">) => void;
  onClose: () => void;
}

function WeightForm({ onSave, onClose }: WeightFormProps) {
  const [date, setDate] = useState(getToday());
  const [weight, setWeight] = useState("");
  const [session, setSession] = useState<WeightSession | "">("");
  const [error, setError] = useState("");
  const [showPhoto, setShowPhoto] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(weight);
    if (isNaN(num) || num <= 0) {
      setError("正しい体重を入力してください");
      return;
    }
    onSave({ date, weight: num, session: session || undefined });
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end overflow-hidden">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-t-2xl shadow-2xl max-h-[80vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-gray-100 flex-shrink-0">
          <h3 className="font-bold text-gray-800 text-base">体重を記録</h3>
          <div className="flex items-center gap-1">
            <button type="button" onClick={() => setShowPhoto(true)}
              className="flex items-center gap-1 text-xs text-violet-600 font-medium bg-violet-50 hover:bg-violet-100 px-2 py-1.5 rounded-lg transition-colors mr-1">
              <Camera size={13} />
              写真から入力
            </button>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100">
              <X size={18} className="text-gray-500" />
            </button>
          </div>
        </div>
        <div className="overflow-y-auto overflow-x-hidden p-4 pb-10">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg p-3">
                <AlertCircle size={15} className="text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* 日付（透明inputオーバーレイ方式） */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">日付</label>
              <div className="relative">
                <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2.5 bg-gray-50 pointer-events-none">
                  <Calendar size={15} className="text-gray-400 flex-shrink-0" />
                  <span className="text-sm text-gray-700">
                    {date === getToday() ? `今日 (${formatDate(date)})` : formatDate(date)}
                  </span>
                </div>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value || getToday())}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
            </div>

            {/* 体重 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">体重</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => { setWeight(e.target.value); setError(""); }}
                  placeholder="例：450.5"
                  step="0.1"
                  min="0"
                  max="2000"
                  inputMode="decimal"
                  className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                  required
                />
                <span className="text-sm text-gray-500 font-medium flex-shrink-0">kg</span>
              </div>
            </div>

            {/* 朝夕 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">朝夕（任意）</label>
              <div className="flex gap-2">
                {(["朝", "夕"] as WeightSession[]).map((s) => (
                  <button key={s} type="button" onClick={() => setSession((v) => (v === s ? "" : s))}
                    className={`flex-1 py-2 rounded-xl border-2 text-sm font-bold transition-all ${
                      session === s ? "border-blue-400 bg-blue-50 text-blue-700" : "border-gray-200 text-gray-500 hover:border-gray-300"
                    }`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button type="button" onClick={onClose}
                className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">
                キャンセル
              </button>
              <button type="submit"
                className="flex-1 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 shadow-md shadow-blue-200">
                保存
              </button>
            </div>
          </form>
        </div>
      </div>
      {showPhoto && (
        <PhotoCapture
          kind="weight"
          title="体重を写真から自動入力"
          onClose={() => setShowPhoto(false)}
          onExtracted={(result) => {
            if (typeof result.date === "string") setDate(result.date);
            if (typeof result.weight === "number") { setWeight(String(result.weight)); setError(""); }
            setShowPhoto(false);
          }}
        />
      )}
    </div>
  );
}

// ============================================================
// 体温記録フォーム
// ============================================================

interface TemperatureFormProps {
  onSave: (r: Omit<TemperatureRecord, "id">) => void;
  onClose: () => void;
}

function TemperatureForm({ onSave, onClose }: TemperatureFormProps) {
  const [date, setDate] = useState(getToday());
  const [temperature, setTemperature] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [showPhoto, setShowPhoto] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(temperature);
    if (isNaN(num) || num < 30 || num > 45) {
      setError("正しい体温を入力してください（30〜45℃）");
      return;
    }
    onSave({ date, temperature: num, notes: notes.trim() || undefined });
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end overflow-hidden">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-t-2xl shadow-2xl max-h-[85vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-gray-100 flex-shrink-0">
          <h3 className="font-bold text-gray-800 text-base">体温を記録</h3>
          <div className="flex items-center gap-1">
            <button type="button" onClick={() => setShowPhoto(true)}
              className="flex items-center gap-1 text-xs text-violet-600 font-medium bg-violet-50 hover:bg-violet-100 px-2 py-1.5 rounded-lg transition-colors mr-1">
              <Camera size={13} />
              写真から入力
            </button>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100">
              <X size={18} className="text-gray-500" />
            </button>
          </div>
        </div>
        <div className="overflow-y-auto overflow-x-hidden p-4 pb-10">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg p-3">
                <AlertCircle size={15} className="text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">日付</label>
              <div className="relative">
                <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2.5 bg-gray-50 pointer-events-none">
                  <Calendar size={15} className="text-gray-400 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{date === getToday() ? `今日 (${formatDate(date)})` : formatDate(date)}</span>
                </div>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value || getToday())}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">体温</label>
              <div className="flex items-center gap-2">
                <input type="number" value={temperature}
                  onChange={(e) => { setTemperature(e.target.value); setError(""); }}
                  placeholder="例：38.2" step="0.1" min="30" max="45" inputMode="decimal"
                  className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-300" required />
                <span className="text-sm text-gray-500 font-medium flex-shrink-0">℃</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">メモ</label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
                placeholder="所見など（任意）" rows={2}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-300 resize-none" />
            </div>
            <div className="flex gap-2 pt-1">
              <button type="button" onClick={onClose} className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">キャンセル</button>
              <button type="submit" className="flex-1 py-3 bg-red-500 text-white rounded-xl text-sm font-bold hover:bg-red-600 shadow-md shadow-red-200">保存</button>
            </div>
          </form>
        </div>
      </div>
      {showPhoto && (
        <PhotoCapture
          kind="temperature"
          title="体温を写真から自動入力"
          onClose={() => setShowPhoto(false)}
          onExtracted={(result) => {
            if (typeof result.date === "string") setDate(result.date);
            if (typeof result.temperature === "number") { setTemperature(String(result.temperature)); setError(""); }
            if (typeof result.notes === "string") setNotes(result.notes);
            setShowPhoto(false);
          }}
        />
      )}
    </div>
  );
}

// ============================================================
// 給餌記録フォーム
// ============================================================

interface FeedingFormProps {
  onSave: (r: Omit<FeedingRecord, "id">) => void;
  onClose: () => void;
}

function FeedingForm({ onSave, onClose }: FeedingFormProps) {
  const [date, setDate] = useState(getToday());
  const [content, setContent] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [showPhoto, setShowPhoto] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      setError("給餌内容を入力してください。");
      return;
    }
    onSave({ date, content: content.trim(), notes: notes.trim() || undefined });
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end overflow-hidden">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-t-2xl shadow-2xl max-h-[85vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-gray-100 flex-shrink-0">
          <h3 className="font-bold text-gray-800 text-base">給餌を記録</h3>
          <div className="flex items-center gap-1">
            <button type="button" onClick={() => setShowPhoto(true)}
              className="flex items-center gap-1 text-xs text-violet-600 font-medium bg-violet-50 hover:bg-violet-100 px-2 py-1.5 rounded-lg transition-colors mr-1">
              <Camera size={13} />
              写真から入力
            </button>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100">
              <X size={18} className="text-gray-500" />
            </button>
          </div>
        </div>
        <div className="overflow-y-auto overflow-x-hidden p-4 pb-10">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg p-3">
                <AlertCircle size={15} className="text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">開始日</label>
              <div className="relative">
                <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2.5 bg-gray-50 pointer-events-none">
                  <Calendar size={15} className="text-gray-400 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{date === getToday() ? `今日 (${formatDate(date)})` : formatDate(date)}</span>
                </div>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value || getToday())}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                給餌内容 <span className="text-red-500">*</span>
              </label>
              <textarea value={content} onChange={(e) => { setContent(e.target.value); setError(""); }}
                placeholder="例：配合飼料2kg、乾草4kg（1日2回）" rows={2}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">メモ</label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
                placeholder="任意" rows={2}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none" />
            </div>
            <div className="flex gap-2 pt-1">
              <button type="button" onClick={onClose} className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">キャンセル</button>
              <button type="submit" className="flex-1 py-3 bg-orange-500 text-white rounded-xl text-sm font-bold hover:bg-orange-600 shadow-md shadow-orange-200">保存</button>
            </div>
          </form>
        </div>
      </div>
      {showPhoto && (
        <PhotoCapture
          kind="feeding"
          title="給餌を写真から自動入力"
          onClose={() => setShowPhoto(false)}
          onExtracted={(result) => {
            if (typeof result.date === "string") setDate(result.date);
            if (typeof result.content === "string") { setContent(result.content); setError(""); }
            if (typeof result.notes === "string") setNotes(result.notes);
            setShowPhoto(false);
          }}
        />
      )}
    </div>
  );
}

// ============================================================
// 手術日記録フォーム
// ============================================================

interface SurgeryFormProps {
  onSave: (r: Omit<SurgeryRecord, "id">) => void;
  onClose: () => void;
}

function SurgeryForm({ onSave, onClose }: SurgeryFormProps) {
  const [date, setDate] = useState(getToday());
  const [notes, setNotes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ date, notes: notes.trim() || undefined });
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end overflow-hidden">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-t-2xl shadow-2xl max-h-[80vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-gray-100 flex-shrink-0">
          <h3 className="font-bold text-gray-800 text-base">手術日を記録</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100">
            <X size={18} className="text-gray-500" />
          </button>
        </div>
        <div className="overflow-y-auto overflow-x-hidden p-4 pb-10">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">手術日</label>
              <div className="relative">
                <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2.5 bg-gray-50 pointer-events-none">
                  <Calendar size={15} className="text-gray-400 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{date === getToday() ? `今日 (${formatDate(date)})` : formatDate(date)}</span>
                </div>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value || getToday())}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">術式・内容</label>
              <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)}
                placeholder="例：疝痛開腹手術（任意）"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
            </div>
            <div className="flex gap-2 pt-1">
              <button type="button" onClick={onClose} className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">キャンセル</button>
              <button type="submit" className="flex-1 py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 shadow-md shadow-indigo-200">保存</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// 排便・排尿記録フォーム
// ============================================================

interface ExcretionFormProps {
  onSave: (r: Omit<ExcretionRecord, "id">) => void;
  onClose: () => void;
}

function ExcretionForm({ onSave, onClose }: ExcretionFormProps) {
  const [date, setDate] = useState(getToday());
  const [content, setContent] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) { setError("排便・排尿の様子を入力してください。"); return; }
    onSave({ date, content: content.trim() });
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end overflow-hidden">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-t-2xl shadow-2xl max-h-[85vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-gray-100 flex-shrink-0">
          <h3 className="font-bold text-gray-800 text-base">排便・排尿を記録</h3>
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">日付</label>
              <div className="relative">
                <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2.5 bg-gray-50 pointer-events-none">
                  <Calendar size={15} className="text-gray-400 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{date === getToday() ? `今日 (${formatDate(date)})` : formatDate(date)}</span>
                </div>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value || getToday())}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">様子・性状</label>
              <textarea value={content} onChange={(e) => { setContent(e.target.value); setError(""); }}
                placeholder="例：ボロは軟便気味、量は普通。尿は正常。" rows={3} autoFocus
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 resize-none" />
            </div>
            <div className="flex gap-2 pt-1">
              <button type="button" onClick={onClose} className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">キャンセル</button>
              <button type="submit" className="flex-1 py-3 bg-amber-500 text-white rounded-xl text-sm font-bold hover:bg-amber-600 shadow-md shadow-amber-200">保存</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// 検査所見フォーム
// ============================================================

interface ExamFindingsFormProps {
  exam: ExamRecord;
  onSave: (findings: string) => void;
  onClose: () => void;
}

function ExamFindingsForm({ exam, onSave, onClose }: ExamFindingsFormProps) {
  const [findings, setFindings] = useState(exam.findings ?? "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(findings);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end overflow-hidden">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-t-2xl shadow-2xl max-h-[80vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-gray-100 flex-shrink-0">
          <div>
            <h3 className="font-bold text-gray-800 text-base">{exam.type}の所見</h3>
            <p className="text-xs text-gray-400 mt-0.5">{formatDate(exam.date)} 実施</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100">
            <X size={18} className="text-gray-500" />
          </button>
        </div>
        <div className="overflow-y-auto overflow-x-hidden p-4 pb-10">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">所見</label>
              <textarea value={findings} onChange={(e) => setFindings(e.target.value)}
                placeholder="例：右前肢に骨瘤形成を確認。経過観察。" rows={5} autoFocus
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 resize-none" />
            </div>
            <div className="flex gap-2 pt-1">
              <button type="button" onClick={onClose} className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">キャンセル</button>
              <button type="submit" className="flex-1 py-3 bg-purple-600 text-white rounded-xl text-sm font-bold hover:bg-purple-700 shadow-md shadow-purple-200">保存</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// 馬情報編集フォーム
// ============================================================

interface EditHorseFormProps {
  horse: Horse;
  onSave: (updated: Horse) => void;
  onClose: () => void;
}

function EditHorseForm({ horse, onSave, onClose }: EditHorseFormProps) {
  const [name, setName] = useState(horse.name);
  const [status, setStatus] = useState<HealthStatus>(horse.status);
  const [careType, setCareType] = useState<InpatientCareType | "">(horse.careType ?? "");
  const [archived, setArchived] = useState(!!horse.archived);
  const [exercise, setExercise] = useState<ExerciseStatus>(horse.exercise ?? "完全舎飼い");
  const [firstVisitDate, setFirstVisitDate] = useState(horse.firstVisitDate);
  const [diagnosis, setDiagnosis] = useState(horse.diagnosis);
  const [pastHistory, setPastHistory] = useState(horse.pastHistory ?? "");
  const [notes, setNotes] = useState(horse.notes ?? "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    // ステータスを退院馬に変更した際、退院日が未設定なら変更した日を自動設定する
    // （分類の変更を忘れていた場合の保険。日付は後から編集で修正できる）
    let dischargeDate = horse.dischargeDate;
    if (status === "退院馬" && horse.status !== "退院馬" && !dischargeDate) {
      dischargeDate = getToday();
    } else if (status !== "退院馬" && horse.status === "退院馬") {
      dischargeDate = undefined;
    }
    onSave({
      ...horse,
      name: name.trim(),
      status,
      careType: status === "入院馬" ? (careType || undefined) : undefined,
      dischargeDate,
      archived,
      exercise,
      firstVisitDate,
      diagnosis: diagnosis.trim(),
      pastHistory: pastHistory.trim() || undefined,
      notes: notes.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end overflow-hidden">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-t-2xl shadow-2xl max-h-[92vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-gray-100 flex-shrink-0">
          <h3 className="font-bold text-gray-800 text-base">馬情報を編集</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100">
            <X size={18} className="text-gray-500" />
          </button>
        </div>
        <div className="overflow-y-auto overflow-x-hidden p-4 pb-10">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">馬名</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">ステータス</label>
              <div className="flex gap-2">
                {(["入院馬", "譲渡馬", "退院馬"] as HealthStatus[]).map((s) => {
                  const colors: Record<HealthStatus, { sel: string; badge: string }> = {
                    入院馬: { sel: "border-red-400 bg-red-50", badge: "bg-red-100 text-red-700 border-red-200" },
                    譲渡馬: { sel: "border-emerald-400 bg-emerald-50", badge: "bg-emerald-100 text-emerald-700 border-emerald-200" },
                    退院馬: { sel: "border-slate-400 bg-slate-50", badge: "bg-slate-100 text-slate-700 border-slate-200" },
                  };
                  return (
                    <label key={s} className={`flex-1 flex justify-center cursor-pointer py-2 rounded-xl border-2 transition-all ${status === s ? colors[s].sel : "border-gray-200"}`}>
                      <input type="radio" value={s} checked={status === s} onChange={() => setStatus(s)} className="sr-only" />
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${colors[s].badge}`}>{s}</span>
                    </label>
                  );
                })}
              </div>
            </div>
            {status === "入院馬" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">区分（内科／様子見）</label>
                <div className="flex gap-2">
                  {(["内科", "様子見"] as InpatientCareType[]).map((c) => (
                    <button key={c} type="button" onClick={() => setCareType((v) => (v === c ? "" : c))}
                      className={`flex-1 py-2 rounded-xl border-2 text-sm font-bold transition-all ${
                        careType === c ? "border-blue-400 bg-blue-50 text-blue-700" : "border-gray-200 text-gray-500 hover:border-gray-300"
                      }`}>
                      {c}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-1">手術をせず経過観察のみの場合は「様子見」を選択してください（任意）。</p>
              </div>
            )}
            <label className="flex items-start gap-2.5 p-3 bg-gray-50 rounded-xl border border-gray-100 cursor-pointer">
              <input type="checkbox" checked={archived} onChange={(e) => setArchived(e.target.checked)}
                className="mt-0.5 w-4 h-4 accent-slate-600 flex-shrink-0" />
              <span>
                <span className="block text-sm font-medium text-gray-700">経過観察を終了する（アーカイブ）</span>
                <span className="block text-xs text-gray-400 mt-0.5">入院馬・譲渡馬・退院馬のどの一覧タブにも表示されなくなります。馬管理メニューの検索からはいつでも見つけられ、記録も残ります。</span>
              </span>
            </label>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">運動状況</label>
              <ExerciseSelector value={exercise} onChange={setExercise} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">入院日</label>
              <input type="date" value={firstVisitDate} onChange={(e) => setFirstVisitDate(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">診断名</label>
              <input type="text" value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} placeholder="例：右前脚跛行、なし"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">既往歴</label>
              <textarea value={pastHistory} onChange={(e) => setPastHistory(e.target.value)}
                placeholder="過去の病歴・手術歴・特記事項など" rows={4}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">メモ・注意事項</label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="管理上の注意点など" rows={3}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none" />
            </div>
            <div className="flex gap-2 pt-1">
              <button type="button" onClick={onClose} className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">キャンセル</button>
              <button type="submit" className="flex-1 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700">保存</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// 確認ダイアログ
// ============================================================

function ConfirmDialog({ message, onConfirm, onCancel }: { message: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-2xl p-5 w-full max-w-sm">
        <div className="flex items-start gap-3 mb-4">
          <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
          <p className="text-sm text-gray-700">{message}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={onCancel} className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">キャンセル</button>
          <button onClick={onConfirm} className="flex-1 py-2.5 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600">削除する</button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// メイン：HorseDetail
// ============================================================

interface HorseDetailProps {
  horse: Horse;
  onBack: () => void;
  onUpdate: (updated: Horse) => void;
  onDelete: () => void;
  onAddCalendarEvent: (title: string) => void;
}

type ModalType = "editHorse" | "addRecord" | "editRecord" | "addWeight" | "addTemperature" | "addExcretion" | "addFeeding" | "addSurgery" | "examFindings" | "confirmDeleteHorse" | "confirmDeleteRecord" | null;

export default function HorseDetail({ horse, onBack, onUpdate, onDelete, onAddCalendarEvent }: HorseDetailProps) {
  const [modal, setModal] = useState<ModalType>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [editTargetRecord, setEditTargetRecord] = useState<HorseRecord | null>(null);
  const [editTargetExam, setEditTargetExam] = useState<ExamRecord | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [isPastHistoryExpanded, setIsPastHistoryExpanded] = useState(false);
  const [isWeightExpanded, setIsWeightExpanded] = useState(false);
  const [isTempExpanded, setIsTempExpanded] = useState(false);
  const [isExcretionExpanded, setIsExcretionExpanded] = useState(false);
  const [isFeedingExpanded, setIsFeedingExpanded] = useState(false);
  const [isSurgeryExpanded, setIsSurgeryExpanded] = useState(false);

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleAddRecord = (record: Omit<HorseRecord, "id">) => {
    const updated: Horse = {
      ...horse,
      records: [...horse.records, { ...record, id: generateId() }].sort(
        (a, b) => b.date.localeCompare(a.date)
      ),
    };
    onUpdate(updated);
    setModal(null);
  };

  const handleDeleteRecord = () => {
    if (!deleteTargetId) return;
    onUpdate({ ...horse, records: horse.records.filter((r) => r.id !== deleteTargetId) });
    setDeleteTargetId(null);
    setModal(null);
  };

  const handleEditRecord = (updated: Omit<HorseRecord, "id">) => {
    if (!editTargetRecord) return;
    const updatedRecords = horse.records
      .map((r) => (r.id === editTargetRecord.id ? { ...updated, id: r.id } : r))
      .sort((a, b) => b.date.localeCompare(a.date));
    onUpdate({ ...horse, records: updatedRecords });
    setEditTargetRecord(null);
    setModal(null);
  };

  const handleAddWeight = (wr: Omit<WeightRecord, "id">) => {
    const updated: Horse = {
      ...horse,
      weightRecords: [...(horse.weightRecords ?? []), { ...wr, id: generateId() }]
        .sort((a, b) => b.date.localeCompare(a.date)),
    };
    onUpdate(updated);
    setModal(null);
  };

  const handleDeleteWeight = (id: string) => {
    onUpdate({ ...horse, weightRecords: (horse.weightRecords ?? []).filter((w) => w.id !== id) });
  };

  const handleAddTemperature = (r: Omit<TemperatureRecord, "id">) => {
    onUpdate({
      ...horse,
      temperatureRecords: [...(horse.temperatureRecords ?? []), { ...r, id: generateId() }]
        .sort((a, b) => b.date.localeCompare(a.date)),
    });
    setModal(null);
  };

  const handleDeleteTemperature = (id: string) => {
    onUpdate({ ...horse, temperatureRecords: (horse.temperatureRecords ?? []).filter((t) => t.id !== id) });
  };

  const handleAddExcretion = (r: Omit<ExcretionRecord, "id">) => {
    onUpdate({
      ...horse,
      excretionRecords: [...(horse.excretionRecords ?? []), { ...r, id: generateId() }]
        .sort((a, b) => b.date.localeCompare(a.date)),
    });
    setModal(null);
  };

  const handleDeleteExcretion = (id: string) => {
    onUpdate({ ...horse, excretionRecords: (horse.excretionRecords ?? []).filter((e) => e.id !== id) });
  };

  const handleAddFeeding = (r: Omit<FeedingRecord, "id">) => {
    onUpdate({
      ...horse,
      feedingRecords: [...(horse.feedingRecords ?? []), { ...r, id: generateId() }]
        .sort((a, b) => b.date.localeCompare(a.date)),
    });
    setModal(null);
  };

  const handleDeleteFeeding = (id: string) => {
    onUpdate({ ...horse, feedingRecords: (horse.feedingRecords ?? []).filter((f) => f.id !== id) });
  };

  const handleAddSurgery = (r: Omit<SurgeryRecord, "id">) => {
    onUpdate({
      ...horse,
      surgeryRecords: [...(horse.surgeryRecords ?? []), { ...r, id: generateId() }]
        .sort((a, b) => b.date.localeCompare(a.date)),
    });
    setModal(null);
  };

  const handleDeleteSurgery = (id: string) => {
    onUpdate({ ...horse, surgeryRecords: (horse.surgeryRecords ?? []).filter((s) => s.id !== id) });
  };

  const handleLogExam = (exam: { key: ExamType; label: string; calendarTitle: string }) => {
    const record: ExamRecord = { id: generateId(), date: getToday(), type: exam.key };
    onUpdate({
      ...horse,
      examRecords: [...(horse.examRecords ?? []), record].sort((a, b) => b.date.localeCompare(a.date)),
    });
    onAddCalendarEvent(exam.calendarTitle);
  };

  const handleSaveExamFindings = (findings: string) => {
    if (!editTargetExam) return;
    onUpdate({
      ...horse,
      examRecords: (horse.examRecords ?? []).map((e) =>
        e.id === editTargetExam.id ? { ...e, findings: findings.trim() || undefined } : e
      ),
    });
    setEditTargetExam(null);
    setModal(null);
  };

  const handleDeleteExam = (id: string) => {
    onUpdate({ ...horse, examRecords: (horse.examRecords ?? []).filter((e) => e.id !== id) });
  };

  const sortedWeights = [...(horse.weightRecords ?? [])].sort((a, b) => b.date.localeCompare(a.date));
  const sortedTemps = [...(horse.temperatureRecords ?? [])].sort((a, b) => b.date.localeCompare(a.date));
  const sortedExcretions = [...(horse.excretionRecords ?? [])].sort((a, b) => b.date.localeCompare(a.date));
  const sortedFeedings = [...(horse.feedingRecords ?? [])].sort((a, b) => b.date.localeCompare(a.date));
  const sortedSurgeries = [...(horse.surgeryRecords ?? [])].sort((a, b) => b.date.localeCompare(a.date));
  const sortedExams = [...(horse.examRecords ?? [])].sort((a, b) => b.date.localeCompare(a.date));

  const sortedRecords = [...horse.records].sort((a, b) => b.date.localeCompare(a.date));

  // 入院◯日目（入院日を1日目として数える）
  const stayDays = Math.max(1, Math.floor((new Date(getToday()).getTime() - new Date(horse.firstVisitDate).getTime()) / 86400000) + 1);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
        <button onClick={onBack} className="p-2 -ml-2 rounded-xl hover:bg-gray-100 active:bg-gray-200">
          <ChevronLeft size={22} className="text-gray-700" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="font-bold text-lg text-gray-800 truncate leading-tight">{horse.name}</h1>
        </div>
        <button onClick={() => setModal("editHorse")} className="p-2 rounded-xl hover:bg-gray-100">
          <Edit2 size={18} className="text-gray-600" />
        </button>
        <button onClick={() => setModal("confirmDeleteHorse")} className="p-2 rounded-xl hover:bg-red-50">
          <Trash2 size={18} className="text-red-400" />
        </button>
      </header>

      <main className="flex-1 overflow-y-auto p-4 pb-8 space-y-4">
        {/* 馬情報カード */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
          <div className={`h-2 ${horse.status === "入院馬" ? "bg-gradient-to-r from-red-300 to-red-500" : "bg-gradient-to-r from-emerald-300 to-emerald-500"}`} />
          <div className="p-4">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {/* 補液（タップでON/OFF） */}
              <button
                onClick={() => onUpdate({ ...horse, fluidTherapy: !horse.fluidTherapy })}
                className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border transition-colors ${
                  horse.fluidTherapy
                    ? "bg-cyan-500 border-cyan-500 text-white shadow-sm shadow-cyan-200"
                    : "bg-white border-gray-200 text-gray-400 hover:border-cyan-300 hover:text-cyan-600"
                }`}
              >
                <Droplet size={12} className="flex-shrink-0" />
                {horse.fluidTherapy ? "補液中" : "補液なし"}
              </button>
              <ExerciseBadge exercise={horse.exercise ?? "完全舎飼い"} />
              {horse.status === "入院馬" && horse.careType && (
                <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border border-blue-200 bg-blue-50 text-blue-700 flex-shrink-0">
                  {horse.careType}
                </span>
              )}
              {/* 給餌（運動状況の横に小さく表示、タップで展開） */}
              <button
                onClick={() => setIsFeedingExpanded((v) => !v)}
                className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full border border-orange-200 bg-orange-50 text-orange-700 max-w-[45%]"
              >
                <Utensils size={11} className="flex-shrink-0" />
                <span className="truncate">
                  {sortedFeedings.length > 0 ? sortedFeedings[0].content : "給餌未登録"}
                </span>
                <ChevronDown size={11} className={`flex-shrink-0 transition-transform ${isFeedingExpanded ? "rotate-180" : ""}`} />
              </button>
            </div>

            {/* 補液中：流速を毎回手入力 */}
            {horse.fluidTherapy && (
              <div className="mb-3 flex items-center gap-2 bg-cyan-50 rounded-xl px-3 py-2 border border-cyan-100">
                <Droplet size={14} className="text-cyan-500 flex-shrink-0" />
                <span className="text-xs text-cyan-700 font-medium flex-shrink-0">流速</span>
                <input
                  type="text"
                  value={horse.fluidRate ?? ""}
                  onChange={(e) => onUpdate({ ...horse, fluidRate: e.target.value })}
                  placeholder="例：60ml/h"
                  className="flex-1 min-w-0 bg-white border border-cyan-200 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-300"
                />
              </div>
            )}

            {/* 給餌の推移（タップで展開） */}
            {isFeedingExpanded && (
              <div className="mb-3 bg-orange-50/60 rounded-xl p-3 border border-orange-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-orange-700">給餌の推移</span>
                  <button
                    onClick={() => setModal("addFeeding")}
                    className="flex items-center gap-1 text-xs text-orange-700 font-medium bg-white hover:bg-orange-100 px-2 py-1 rounded-lg transition-colors border border-orange-200"
                  >
                    <Plus size={12} />
                    記録追加
                  </button>
                </div>
                {sortedFeedings.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-2">記録がありません</p>
                ) : (
                  <div className="space-y-1.5">
                    {sortedFeedings.map((f, idx) => (
                      <div key={f.id} className="flex items-start gap-2">
                        <span className="text-xs text-gray-400 w-20 flex-shrink-0 pt-0.5">{formatDate(f.date)}〜</span>
                        <span className={`flex-1 text-sm ${idx === 0 ? "text-orange-700 font-semibold" : "text-gray-700"}`}>
                          {f.content}
                          {f.notes && <span className="block text-xs text-gray-400 mt-0.5">{f.notes}</span>}
                        </span>
                        <button onClick={() => handleDeleteFeeding(f.id)} className="p-1 hover:bg-red-50 rounded-lg flex-shrink-0">
                          <Trash2 size={12} className="text-red-300 hover:text-red-500" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="space-y-2.5">
              {/* 入院日 ＋ 手術日（横並び） */}
              <div className="flex items-start gap-2">
                <div className="flex items-start gap-2 flex-1">
                  <Calendar size={15} className="text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-xs text-gray-500">入院日</span>
                    <p className="text-sm font-semibold text-gray-800 flex items-center gap-1.5">
                      {formatDate(horse.firstVisitDate)}
                      <span className="text-xs font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full">{stayDays}日目</span>
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsSurgeryExpanded((v) => !v)}
                  className="flex items-start gap-2 flex-1 text-left"
                >
                  <Scissors size={15} className="text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-xs text-gray-500">手術日</span>
                    <p className="flex items-center gap-1 text-sm font-semibold text-gray-800">
                      {sortedSurgeries.length > 0
                        ? <>{formatDate(sortedSurgeries[0].date)}{sortedSurgeries.length > 1 && <span className="text-xs font-normal text-gray-500"> 他{sortedSurgeries.length - 1}回</span>}</>
                        : <span className="text-gray-400 font-normal text-xs">記録なし</span>
                      }
                      <ChevronDown size={13} className={`text-gray-400 transition-transform ${isSurgeryExpanded ? "rotate-180" : ""}`} />
                    </p>
                  </div>
                </button>
              </div>

              {/* 手術日の一覧（タップで展開） */}
              {isSurgeryExpanded && (
                <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-500">手術日の記録</span>
                    <button
                      onClick={() => setModal("addSurgery")}
                      className="flex items-center gap-1 text-xs text-indigo-600 font-medium bg-indigo-50 hover:bg-indigo-100 px-2 py-1 rounded-lg transition-colors"
                    >
                      <Plus size={12} />
                      記録追加
                    </button>
                  </div>
                  {sortedSurgeries.length === 0 ? (
                    <p className="text-xs text-gray-400 text-center py-2">記録がありません</p>
                  ) : (
                    <div className="space-y-1.5">
                      {sortedSurgeries.map((s, idx) => (
                        <div key={s.id} className="flex items-center gap-2">
                          <span className="text-xs text-gray-400 w-20 flex-shrink-0">{formatDate(s.date)}</span>
                          <span className={`flex-1 text-sm font-semibold ${idx === 0 ? "text-indigo-600" : "text-gray-700"}`}>
                            {s.notes || "手術"}
                          </span>
                          <button
                            onClick={() => handleDeleteSurgery(s.id)}
                            className="p-1 hover:bg-red-50 rounded-lg flex-shrink-0"
                          >
                            <Trash2 size={12} className="text-red-300 hover:text-red-500" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 退院日（入力すると自動的に退院馬へ移動） */}
              {horse.status !== "譲渡馬" && (
                <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2.5 border border-gray-100">
                  <LogOut size={15} className="text-gray-400 flex-shrink-0" />
                  <span className="text-xs text-gray-500 flex-shrink-0">退院日</span>
                  <div className="flex-1 relative min-w-0">
                    <div className="pointer-events-none">
                      <span className={`text-sm ${horse.dischargeDate ? "text-gray-700 font-semibold" : "text-blue-500 font-medium"}`}>
                        {horse.dischargeDate ? formatDate(horse.dischargeDate) : "未定　→ タップで設定"}
                      </span>
                    </div>
                    <input
                      type="date"
                      value={horse.dischargeDate ?? ""}
                      onChange={(e) => {
                        const newDate = e.target.value || undefined;
                        onUpdate({
                          ...horse,
                          dischargeDate: newDate,
                          status: newDate ? "退院馬" : (horse.status === "退院馬" ? "入院馬" : horse.status),
                        });
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>
                  {horse.dischargeDate && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdate({
                          ...horse,
                          dischargeDate: undefined,
                          status: horse.status === "退院馬" ? "入院馬" : horse.status,
                        });
                      }}
                      className="text-xs text-gray-400 flex-shrink-0 relative z-10"
                    >
                      未定に戻す
                    </button>
                  )}
                </div>
              )}

              {/* 現体重 ＋ 体温（横並び） */}
              <div className="flex items-start gap-2">
                <button
                  onClick={() => setIsWeightExpanded((v) => !v)}
                  className="flex items-start gap-2 flex-1 text-left"
                >
                  <Scale size={15} className="text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-xs text-gray-500">現体重</span>
                    <p className="flex items-center gap-1 text-sm font-semibold text-gray-800">
                      {sortedWeights.length > 0
                        ? <>{sortedWeights[0].weight} <span className="text-xs font-normal text-gray-500">kg</span></>
                        : <span className="text-gray-400 font-normal text-xs">未記録</span>
                      }
                      <ChevronDown size={13} className={`text-gray-400 transition-transform ${isWeightExpanded ? "rotate-180" : ""}`} />
                    </p>
                  </div>
                </button>
                <button
                  onClick={() => setIsTempExpanded((v) => !v)}
                  className="flex items-start gap-2 flex-1 text-left"
                >
                  <Thermometer size={15} className="text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-xs text-gray-500">体温</span>
                    <p className="flex items-center gap-1 text-sm font-semibold text-gray-800">
                      {sortedTemps.length > 0
                        ? <>{sortedTemps[0].temperature} <span className="text-xs font-normal text-gray-500">℃</span></>
                        : <span className="text-gray-400 font-normal text-xs">未記録</span>
                      }
                      <ChevronDown size={13} className={`text-gray-400 transition-transform ${isTempExpanded ? "rotate-180" : ""}`} />
                    </p>
                  </div>
                </button>
                <button
                  onClick={() => setIsExcretionExpanded((v) => !v)}
                  className="flex items-start gap-2 flex-1 text-left min-w-0"
                >
                  <Droplets size={15} className="text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="min-w-0">
                    <span className="text-xs text-gray-500">排便・排尿</span>
                    <p className="flex items-center gap-1 text-sm font-semibold text-gray-800">
                      {sortedExcretions.length > 0
                        ? <span className="truncate max-w-[9rem]">{sortedExcretions[0].content}</span>
                        : <span className="text-gray-400 font-normal text-xs">未記録</span>
                      }
                      <ChevronDown size={13} className={`text-gray-400 transition-transform flex-shrink-0 ${isExcretionExpanded ? "rotate-180" : ""}`} />
                    </p>
                  </div>
                </button>
              </div>

              {/* 体重推移（タップで展開） */}
              {isWeightExpanded && (
                <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-500">体重推移</span>
                    <button
                      onClick={() => setModal("addWeight")}
                      className="flex items-center gap-1 text-xs text-blue-600 font-medium bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded-lg transition-colors"
                    >
                      <Plus size={12} />
                      記録追加
                    </button>
                  </div>
                  {sortedWeights.length === 0 ? (
                    <p className="text-xs text-gray-400 text-center py-2">記録がありません</p>
                  ) : (
                    <div className="space-y-1.5">
                      {sortedWeights.map((wr, idx) => (
                        <div key={wr.id} className="flex items-center gap-2">
                          <span className="text-xs text-gray-400 w-20 flex-shrink-0">{formatDate(wr.date)}</span>
                          {wr.session && (
                            <span className="text-xs font-bold text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded-full flex-shrink-0">{wr.session}</span>
                          )}
                          <span className={`flex-1 text-sm font-semibold ${idx === 0 ? "text-blue-600" : "text-gray-700"}`}>
                            {wr.weight} kg
                          </span>
                          <button
                            onClick={() => handleDeleteWeight(wr.id)}
                            className="p-1 hover:bg-red-50 rounded-lg flex-shrink-0"
                          >
                            <Trash2 size={12} className="text-red-300 hover:text-red-500" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {/* 診断名 */}
              <div className="flex items-start gap-2">
                <Activity size={15} className="text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="min-w-0">
                  <span className="text-xs text-gray-500">診断名</span>
                  <p className="text-sm font-semibold text-gray-800">{horse.diagnosis || "なし"}</p>
                </div>
              </div>

              {/* 体温推移（タップで展開） */}
              {isTempExpanded && (
                <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-500">体温の推移</span>
                    <button
                      onClick={() => setModal("addTemperature")}
                      className="flex items-center gap-1 text-xs text-red-600 font-medium bg-red-50 hover:bg-red-100 px-2 py-1 rounded-lg transition-colors"
                    >
                      <Plus size={12} />
                      記録追加
                    </button>
                  </div>
                  {sortedTemps.length === 0 ? (
                    <p className="text-xs text-gray-400 text-center py-2">記録がありません</p>
                  ) : (
                    <div className="space-y-1.5">
                      {sortedTemps.map((t, idx) => (
                        <div key={t.id} className="flex items-center gap-2">
                          <span className="text-xs text-gray-400 w-20 flex-shrink-0">{formatDate(t.date)}</span>
                          <span className={`flex-1 text-sm font-semibold ${idx === 0 ? "text-red-600" : "text-gray-700"}`}>
                            {t.temperature} ℃
                          </span>
                          {t.notes && <span className="text-xs text-gray-400 truncate max-w-[30%]">{t.notes}</span>}
                          <button
                            onClick={() => handleDeleteTemperature(t.id)}
                            className="p-1 hover:bg-red-50 rounded-lg flex-shrink-0"
                          >
                            <Trash2 size={12} className="text-red-300 hover:text-red-500" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 排便・排尿（タップで展開） */}
              {isExcretionExpanded && (
                <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-500">排便・排尿の記録</span>
                    <button
                      onClick={() => setModal("addExcretion")}
                      className="flex items-center gap-1 text-xs text-amber-600 font-medium bg-amber-50 hover:bg-amber-100 px-2 py-1 rounded-lg transition-colors"
                    >
                      <Plus size={12} />
                      記録追加
                    </button>
                  </div>
                  {sortedExcretions.length === 0 ? (
                    <p className="text-xs text-gray-400 text-center py-2">記録がありません</p>
                  ) : (
                    <div className="space-y-1.5">
                      {sortedExcretions.map((ex, idx) => (
                        <div key={ex.id} className="flex items-start gap-2">
                          <span className="text-xs text-gray-400 w-20 flex-shrink-0 pt-0.5">{formatDate(ex.date)}</span>
                          <span className={`flex-1 text-sm whitespace-pre-wrap ${idx === 0 ? "text-amber-700 font-semibold" : "text-gray-700"}`}>
                            {ex.content}
                          </span>
                          <button
                            onClick={() => handleDeleteExcretion(ex.id)}
                            className="p-1 hover:bg-red-50 rounded-lg flex-shrink-0"
                          >
                            <Trash2 size={12} className="text-red-300 hover:text-red-500" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 既往歴 */}
              {horse.pastHistory && (
                <div className="flex items-start gap-2">
                  <BookOpen size={15} className="text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="text-xs text-gray-500">既往歴</span>
                    <p className={`text-sm text-gray-700 whitespace-pre-wrap leading-relaxed ${
                      !isPastHistoryExpanded && horse.pastHistory.length > 100
                        ? "line-clamp-3"
                        : ""
                    }`}>
                      {horse.pastHistory}
                    </p>
                    {horse.pastHistory.length > 100 && (
                      <button
                        onClick={() => setIsPastHistoryExpanded((v) => !v)}
                        className="mt-1 text-xs text-blue-500 hover:text-blue-700 font-medium flex items-center gap-0.5"
                      >
                        {isPastHistoryExpanded ? "折りたたむ ▲" : "…続きを読む ▼"}
                      </button>
                    )}
                  </div>
                </div>
              )}

              {horse.notes && (
                <div className="flex items-start gap-2">
                  <FileText size={15} className="text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-xs text-gray-500">メモ</span>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{horse.notes}</p>
                  </div>
                </div>
              )}

              {/* 検査（US・X-ray・その他） */}
              <div className="pt-3 mt-1 border-t border-gray-100">
                <div className="flex items-center gap-1.5 mb-2">
                  <FlaskConical size={15} className="text-gray-400" />
                  <span className="text-xs text-gray-500 font-medium">検査</span>
                </div>
                <div className="grid grid-cols-3 gap-2 mb-2">
                  {EXAM_TYPES.map((exam) => (
                    <button
                      key={exam.key}
                      type="button"
                      onClick={() => handleLogExam(exam)}
                      className="py-2.5 rounded-xl border-2 border-gray-200 text-sm font-bold text-gray-600 hover:border-purple-300 hover:bg-purple-50 hover:text-purple-700 active:scale-95 transition-all"
                    >
                      {exam.label}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mb-2">実施したらボタンをタップ。カレンダーに自動記録されます。</p>
                {sortedExams.length > 0 && (
                  <div className="space-y-1.5">
                    {sortedExams.map((exam) => (
                      <div key={exam.id} className="flex items-start gap-2 bg-gray-50 hover:bg-gray-100 rounded-lg px-2.5 py-1.5 transition-colors">
                        <button
                          type="button"
                          onClick={() => { setEditTargetExam(exam); setModal("examFindings"); }}
                          className="flex-1 flex items-start gap-2 text-left min-w-0"
                        >
                          <span className="text-xs text-gray-400 w-16 flex-shrink-0 pt-0.5">{formatDate(exam.date)}</span>
                          <span className="text-xs font-bold text-purple-600 flex-shrink-0 pt-0.5">{exam.type}</span>
                          <span className="flex-1 text-xs text-gray-600 min-w-0 truncate pt-0.5">
                            {exam.findings || <span className="text-gray-400">タップして所見を追加</span>}
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteExam(exam.id)}
                          className="p-1 hover:bg-red-50 rounded-lg flex-shrink-0"
                        >
                          <Trash2 size={12} className="text-red-300 hover:text-red-500" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 投薬 */}
        <MedicationSection horse={horse} onUpdate={onUpdate} />

        {/* 血液検査 */}
        <BloodTestSection horse={horse} onUpdate={onUpdate} />

        {/* 履歴セクション */}
        <section>
          {/* セクションヘッダー */}
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 className="font-bold text-gray-700 text-sm">履歴</h2>
            <button
              onClick={() => setModal("addRecord")}
              className="flex items-center gap-1 text-xs text-blue-600 font-medium bg-blue-50 hover:bg-blue-100 px-2.5 py-1.5 rounded-lg transition-colors"
            >
              <Plus size={14} />
              追加
            </button>
          </div>

          {/* 履歴リスト */}
          {sortedRecords.length === 0 ? (
            <div className="bg-white rounded-xl border border-dashed border-gray-200 p-8 text-center">
              <p className="text-sm text-gray-400">記録がありません</p>
            </div>
          ) : (
            <div className="space-y-2">
              {sortedRecords.map((record) => {
                const isExpanded = expandedIds.has(record.id);
                return (
                  <div
                    key={record.id}
                    className="bg-white rounded-xl shadow-sm border border-blue-100 overflow-hidden"
                  >
                    {/* 左アクセントバー */}
                    <div className="flex">
                      <div className="w-1 flex-shrink-0 bg-gradient-to-b from-blue-400 to-blue-600" />
                      <div
                        className="flex-1 flex items-start p-3 cursor-pointer active:bg-gray-50"
                        onClick={() => toggleExpand(record.id)}
                      >
                        <div className="flex-1 min-w-0">
                          {/* 日付 + 獣医師 */}
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs text-gray-400 font-medium flex-shrink-0">
                              {formatDate(record.date)}
                            </span>
                            {record.veterinarian && (
                              <span className="text-xs text-gray-400 truncate">
                                {record.veterinarian}
                              </span>
                            )}
                          </div>

                          {/* 体調・状態（メイン表示） */}
                          <p className="text-sm font-semibold text-gray-800">
                            {record.condition}
                          </p>

                          {/* 処置内容をサブテキストで */}
                          {record.treatment && !isExpanded && (
                            <p className="text-xs text-blue-600 mt-0.5 truncate">
                              処置：{record.treatment}
                            </p>
                          )}

                          {/* 展開時の詳細 */}
                          {isExpanded && (
                            <div className="mt-2 space-y-2">
                              {record.treatment && (
                                <div className="text-xs">
                                  <span className="text-gray-500 font-medium">処置：</span>
                                  <span className="text-gray-700">{record.treatment}</span>
                                </div>
                              )}
                              {record.medication && (
                                <div className="bg-blue-50 rounded-lg px-2.5 py-1.5 text-xs text-blue-700 font-medium">
                                  💊 {record.medication}
                                </div>
                              )}
                              {record.notes && (
                                <p className="text-sm text-gray-600 whitespace-pre-wrap">
                                  {record.notes}
                                </p>
                              )}
                            </div>
                          )}
                        </div>

                        {/* 右側：編集・削除・展開 */}
                        <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditTargetRecord(record);
                              setModal("editRecord");
                            }}
                            className="p-1.5 hover:bg-blue-50 rounded-lg"
                          >
                            <Edit2 size={14} className="text-blue-300 hover:text-blue-500" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteTargetId(record.id);
                              setModal("confirmDeleteRecord");
                            }}
                            className="p-1.5 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 size={14} className="text-red-300 hover:text-red-500" />
                          </button>
                          {isExpanded ? (
                            <ChevronUp size={16} className="text-gray-400" />
                          ) : (
                            <ChevronDown size={16} className="text-gray-400" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* モーダル */}
      {modal === "addRecord" && (
        <RecordForm onSave={handleAddRecord} onClose={() => setModal(null)} />
      )}
      {modal === "editRecord" && editTargetRecord && (
        <RecordForm
          initialRecord={editTargetRecord}
          onSave={handleEditRecord}
          onClose={() => { setEditTargetRecord(null); setModal(null); }}
        />
      )}
      {modal === "addWeight" && (
        <WeightForm onSave={handleAddWeight} onClose={() => setModal(null)} />
      )}
      {modal === "addTemperature" && (
        <TemperatureForm onSave={handleAddTemperature} onClose={() => setModal(null)} />
      )}
      {modal === "addExcretion" && (
        <ExcretionForm onSave={handleAddExcretion} onClose={() => setModal(null)} />
      )}
      {modal === "addFeeding" && (
        <FeedingForm onSave={handleAddFeeding} onClose={() => setModal(null)} />
      )}
      {modal === "addSurgery" && (
        <SurgeryForm onSave={handleAddSurgery} onClose={() => setModal(null)} />
      )}
      {modal === "examFindings" && editTargetExam && (
        <ExamFindingsForm
          exam={editTargetExam}
          onSave={handleSaveExamFindings}
          onClose={() => { setEditTargetExam(null); setModal(null); }}
        />
      )}
      {modal === "editHorse" && (
        <EditHorseForm horse={horse} onSave={(u) => { onUpdate(u); setModal(null); }} onClose={() => setModal(null)} />
      )}
      {modal === "confirmDeleteHorse" && (
        <ConfirmDialog
          message={`「${horse.name}」を削除しますか？この操作は元に戻せません。`}
          onConfirm={onDelete}
          onCancel={() => setModal(null)}
        />
      )}
      {modal === "confirmDeleteRecord" && (
        <ConfirmDialog
          message="この記録を削除しますか？"
          onConfirm={handleDeleteRecord}
          onCancel={() => { setDeleteTargetId(null); setModal(null); }}
        />
      )}
    </div>
  );
}
