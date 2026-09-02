"use client";

import React, { useState } from "react";
import {
  ChevronLeft, ChevronRight, Plus, X, Trash2, CalendarDays,
} from "lucide-react";
import { Horse, HealthStatus, CalendarEvent } from "@/lib/types";

const STATUS_GROUPS: HealthStatus[] = ["入院馬", "譲渡馬", "退院馬"];

// ============================================================
// 定数
// ============================================================

export const EVENT_TYPES = [
  { label: "レントゲン撮影", bg: "bg-purple-100", text: "text-purple-700", border: "border-purple-300", dot: "bg-purple-400" },
  { label: "血液検査",       bg: "bg-red-100",    text: "text-red-700",    border: "border-red-300",    dot: "bg-red-400"    },
  { label: "エコー検査",     bg: "bg-blue-100",   text: "text-blue-700",   border: "border-blue-300",   dot: "bg-blue-400"   },
  { label: "再診",           bg: "bg-green-100",  text: "text-green-700",  border: "border-green-300",  dot: "bg-green-400"  },
  { label: "手術",           bg: "bg-orange-100", text: "text-orange-700", border: "border-orange-300", dot: "bg-orange-400" },
  { label: "その他",         bg: "bg-gray-100",   text: "text-gray-700",   border: "border-gray-300",   dot: "bg-gray-400"   },
];

type EventStyle = { bg: string; text: string; border: string; dot: string };
const EVENT_STYLE_MAP: Record<string, EventStyle> = {};
EVENT_TYPES.forEach((t) => {
  EVENT_STYLE_MAP[t.label] = { bg: t.bg, text: t.text, border: t.border, dot: t.dot };
});
const DEFAULT_STYLE: EventStyle = { bg: "bg-gray-100", text: "text-gray-700", border: "border-gray-300", dot: "bg-gray-400" };

const MONTH_NAMES = ["1月","2月","3月","4月","5月","6月","7月","8月","9月","10月","11月","12月"];
const DAY_NAMES   = ["月","火","水","木","金","土","日"];

// ============================================================
// ユーティリティ
// ============================================================

function getToday() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}

function generateId() {
  return `${Date.now()}_${Math.random().toString(36).substr(2,8)}`;
}

function formatDisplayDate(dateStr: string) {
  const [y, m, d] = dateStr.split("-");
  return `${y}年${parseInt(m)}月${parseInt(d)}日`;
}

function formatShortDate(dateStr: string) {
  const [, m, d] = dateStr.split("-");
  return `${parseInt(m)}/${parseInt(d)}`;
}

// ============================================================
// イベントバッジ
// ============================================================

function EventBadge({ title, small }: { title: string; small?: boolean }) {
  const s = EVENT_STYLE_MAP[title] ?? DEFAULT_STYLE;
  return (
    <span className={`inline-flex items-center gap-1 font-bold rounded-full border flex-shrink-0 ${
      small ? "text-xs px-1.5 py-0.5" : "text-xs px-2 py-0.5"
    } ${s.bg} ${s.text} ${s.border}`}>
      <span className={`rounded-full flex-shrink-0 ${small ? "w-1.5 h-1.5" : "w-2 h-2"} ${s.dot}`} />
      {title}
    </span>
  );
}

// ============================================================
// 予定追加モーダル
// ============================================================

function AddEventModal({
  selectedDate,
  horses,
  onSave,
  onClose,
}: {
  selectedDate: string;
  horses: Horse[];
  onSave: (ev: CalendarEvent) => void;
  onClose: () => void;
}) {
  const selectableHorses = horses.filter((h) => !h.archived);
  const [date, setDate] = useState(selectedDate);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [horseId, setHorseId] = useState(selectableHorses[0]?.id ?? "");
  const [title, setTitle] = useState("レントゲン撮影");
  const [customTitle, setCustomTitle] = useState("");
  const [notes, setNotes] = useState("");

  const selectedHorse = selectableHorses.find((h) => h.id === horseId);

  const handleSave = () => {
    if (!horseId) return;
    const eventTitle = title === "その他" ? (customTitle.trim() || "その他") : title;
    onSave({
      id: generateId(),
      date,
      horseId,
      horseName: selectedHorse?.name ?? "不明",
      title: eventTitle,
      notes: notes.trim() || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end overflow-hidden">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-t-2xl shadow-2xl max-h-[88vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-gray-100 flex-shrink-0">
          <h3 className="font-bold text-gray-800 text-base">予定を追加</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100">
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        <div className="overflow-y-auto overflow-x-hidden p-4 pb-10 space-y-4">
          {/* 日付 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">日付</label>
            {showDatePicker ? (
              <div className="flex items-center gap-2">
                <input
                  type="date" value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="flex-1 border border-blue-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowDatePicker(false)}
                  className="text-xs text-blue-500 font-medium px-1"
                >
                  完了
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between border border-gray-200 rounded-xl px-3 py-2.5 bg-gray-50">
                <div className="flex items-center gap-2">
                  <CalendarDays size={15} className="text-gray-400 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{formatDisplayDate(date)}</span>
                </div>
                <button
                  onClick={() => setShowDatePicker(true)}
                  className="text-xs text-blue-500 font-medium"
                >
                  変更
                </button>
              </div>
            )}
          </div>

          {/* 対象の馬 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">対象の馬</label>
            {selectableHorses.length === 0 ? (
              <p className="text-sm text-gray-400">馬が登録されていません</p>
            ) : (
              <select
                value={horseId}
                onChange={(e) => setHorseId(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
              >
                {STATUS_GROUPS.map((status) => {
                  const group = selectableHorses.filter((h) => h.status === status);
                  if (group.length === 0) return null;
                  return (
                    <optgroup key={status} label={status}>
                      {group.map((h) => (
                        <option key={h.id} value={h.id}>{h.name}</option>
                      ))}
                    </optgroup>
                  );
                })}
              </select>
            )}
          </div>

          {/* 予定の種類 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">予定の種類</label>
            <div className="grid grid-cols-2 gap-2">
              {EVENT_TYPES.map((t) => {
                const selected = title === t.label;
                return (
                  <button
                    key={t.label}
                    type="button"
                    onClick={() => setTitle(t.label)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-left transition-all ${
                      selected
                        ? `${t.bg} ${t.text} border-current`
                        : "bg-white border-gray-200 text-gray-500 hover:border-gray-300"
                    }`}
                  >
                    <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${selected ? t.dot : "bg-gray-300"}`} />
                    <span className="text-sm font-medium truncate">{t.label}</span>
                    {selected && <span className="ml-auto text-xs">✓</span>}
                  </button>
                );
              })}
            </div>
            {title === "その他" && (
              <input
                type="text"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder="予定の名前を入力"
                className="mt-2 w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            )}
          </div>

          {/* メモ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">メモ（任意）</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="詳細・注意事項など"
              rows={2}
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
              type="button"
              onClick={handleSave}
              disabled={!horseId}
              className="flex-1 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 shadow-md shadow-blue-200 disabled:opacity-40"
            >
              追加
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// メイン：CalendarView
// ============================================================

interface CalendarViewProps {
  horses: Horse[];
  events: CalendarEvent[];
  onAddEvent: (ev: CalendarEvent) => void;
  onDeleteEvent: (id: string) => void;
  onBack: () => void;
}

export default function CalendarView({
  horses, events, onAddEvent, onDeleteEvent, onBack,
}: CalendarViewProps) {
  const today = getToday();
  const now = new Date();

  const [viewYear,  setViewYear]  = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [selectedDate, setSelectedDate] = useState(today);
  const [showAddForm,  setShowAddForm]  = useState(false);

  // ---- カレンダーグリッド生成 ----
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayRaw = new Date(viewYear, viewMonth, 1).getDay(); // 0=Sun
  const firstDay    = firstDayRaw === 0 ? 6 : firstDayRaw - 1;  // Mon=0

  const weeks: (number | null)[][] = [];
  let week: (number | null)[] = Array(firstDay).fill(null);
  for (let d = 1; d <= daysInMonth; d++) {
    week.push(d);
    if (week.length === 7) { weeks.push(week); week = []; }
  }
  if (week.length > 0) {
    while (week.length < 7) week.push(null);
    weeks.push(week);
  }

  // ---- 日付ごとのイベントmap ----
  const eventsByDate: Record<string, CalendarEvent[]> = {};
  events.forEach((e) => {
    if (!eventsByDate[e.date]) eventsByDate[e.date] = [];
    eventsByDate[e.date].push(e);
  });

  const selectedEvents = eventsByDate[selectedDate] ?? [];

  // ---- 今後の予定（今日以降、最大15件）実施済みの記録（検査ログなど）は含めない ----
  const upcomingEvents = [...events]
    .filter((e) => e.date >= today && !e.isLog)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 15);

  // ---- 日付ごとに入院していた馬（入院日〜退院日で判定。退院済み・アーカイブ済みでも
  //      その期間内であれば対象に含める。ステータスは問わない。未来日は対象外） ----
  const hospitalizedOn = (dateStr: string): Horse[] => {
    if (dateStr > today) return [];
    return horses.filter((h) => h.firstVisitDate <= dateStr && (!h.dischargeDate || h.dischargeDate >= dateStr));
  };
  const selectedHospitalized = hospitalizedOn(selectedDate);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear((y) => y - 1); setViewMonth(11); }
    else setViewMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear((y) => y + 1); setViewMonth(0); }
    else setViewMonth((m) => m + 1);
  };

  const goToday = () => {
    const n = new Date();
    setViewYear(n.getFullYear());
    setViewMonth(n.getMonth());
    setSelectedDate(today);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
        <button onClick={onBack} className="p-2 -ml-2 rounded-xl hover:bg-gray-100 active:bg-gray-200">
          <ChevronLeft size={22} className="text-gray-700" />
        </button>
        <h1 className="font-bold text-base text-gray-800 flex-1">カレンダー</h1>
        <button
          onClick={goToday}
          className="text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
        >
          今日
        </button>
        <button
          onClick={() => setShowAddForm(true)}
          className="p-2 -mr-2 rounded-xl hover:bg-gray-100 active:bg-gray-200"
          title="予定を追加"
        >
          <Plus size={22} className="text-gray-700" />
        </button>
      </header>

      <main className="flex-1 overflow-y-auto p-4 pb-8 space-y-4">

        {/* ── カレンダー本体 ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* 月ナビ */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-gray-100 active:bg-gray-200">
              <ChevronLeft size={18} className="text-gray-600" />
            </button>
            <span className="font-bold text-gray-800">{viewYear}年 {MONTH_NAMES[viewMonth]}</span>
            <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-gray-100 active:bg-gray-200">
              <ChevronRight size={18} className="text-gray-600" />
            </button>
          </div>

          {/* 曜日ヘッダー */}
          <div className="grid grid-cols-7 px-3 pt-2 pb-1">
            {DAY_NAMES.map((d, i) => (
              <div key={d} className={`text-center text-xs font-semibold py-1 ${
                i === 5 ? "text-blue-500" : i === 6 ? "text-red-500" : "text-gray-400"
              }`}>{d}</div>
            ))}
          </div>

          {/* グリッド */}
          <div className="px-3 pb-3">
            {weeks.map((wk, wi) => (
              <div key={wi} className="grid grid-cols-7">
                {wk.map((day, di) => {
                  if (!day) return <div key={di} className="py-1" />;
                  const ds = `${viewYear}-${String(viewMonth+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
                  const isToday    = ds === today;
                  const isSelected = ds === selectedDate;
                  const dayEvs     = eventsByDate[ds] ?? [];
                  const stayCount  = hospitalizedOn(ds).length;
                  const isSat = di === 5;
                  const isSun = di === 6;
                  return (
                    <button
                      key={di}
                      onClick={() => setSelectedDate(ds)}
                      className={`flex flex-col items-center py-1 mx-0.5 rounded-xl transition-colors active:scale-95 ${
                        isSelected
                          ? "bg-blue-600 shadow-sm"
                          : isToday
                          ? "bg-blue-50 ring-1 ring-blue-300"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <span className={`text-sm font-medium leading-tight ${
                        isSelected ? "text-white font-bold" :
                        isToday    ? "text-blue-600 font-bold" :
                        isSat      ? "text-blue-500" :
                        isSun      ? "text-red-500" :
                                     "text-gray-700"
                      }`}>{day}</span>
                      {/* 入院頭数 */}
                      <span className={`text-[9px] font-bold leading-tight mt-0.5 ${
                        stayCount === 0 ? "invisible" : isSelected ? "text-white" : "text-red-500"
                      }`}>
                        {stayCount || 0}頭
                      </span>
                      {/* イベントドット */}
                      <div className="flex gap-0.5 mt-0.5 h-2 items-center">
                        {dayEvs.slice(0, 3).map((ev, ei) => {
                          const s = EVENT_STYLE_MAP[ev.title] ?? DEFAULT_STYLE;
                          return (
                            <span key={ei} className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-white/80" : s.dot}`} />
                          );
                        })}
                      </div>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* ── 選択日のイベント ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="font-bold text-gray-700 text-sm">
                {formatDisplayDate(selectedDate)}
              </h2>
              {selectedDate === today && (
                <span className="text-xs text-blue-500 font-medium">今日</span>
              )}
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-1 text-xs text-blue-600 font-medium bg-blue-50 hover:bg-blue-100 active:bg-blue-200 px-2.5 py-1.5 rounded-lg transition-colors"
            >
              <Plus size={14} />
              予定を追加
            </button>
          </div>

          {selectedHospitalized.length > 0 && (
            <div className="mb-3 p-2.5 bg-red-50 rounded-xl border border-red-100">
              <p className="text-xs font-semibold text-red-600 mb-1">
                {selectedDate === today ? "入院中" : "入院していた"}（{selectedHospitalized.length}頭）
              </p>
              <p className="text-xs text-gray-700 leading-relaxed">
                {selectedHospitalized.map((h) => h.name).join("、")}
              </p>
            </div>
          )}

          {selectedEvents.length === 0 ? (
            <p className="text-sm text-gray-400 py-3 text-center">この日の予定はありません</p>
          ) : (
            <div className="space-y-2">
              {selectedEvents.map((ev) => {
                const s = EVENT_STYLE_MAP[ev.title] ?? DEFAULT_STYLE;
                return (
                  <div key={ev.id} className={`flex items-start gap-3 p-3 rounded-xl border ${s.bg} ${s.border}`}>
                    <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1 ${s.dot}`} />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-bold ${s.text}`}>{ev.title}</p>
                      <p className="text-sm text-gray-700 font-medium mt-0.5">{ev.horseName}</p>
                      {ev.notes && <p className="text-xs text-gray-500 mt-0.5">{ev.notes}</p>}
                    </div>
                    <button
                      onClick={() => onDeleteEvent(ev.id)}
                      className="p-1.5 hover:bg-white/60 rounded-lg flex-shrink-0"
                    >
                      <Trash2 size={14} className="text-gray-400 hover:text-red-500" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── 今後の予定 ── */}
        {upcomingEvents.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <h2 className="font-bold text-gray-700 text-sm mb-3 flex items-center gap-2">
              <CalendarDays size={15} className="text-blue-500" />
              今後の予定
            </h2>
            <div className="space-y-0">
              {upcomingEvents.map((ev, idx) => {
                const s = EVENT_STYLE_MAP[ev.title] ?? DEFAULT_STYLE;
                const isFirst = idx === 0 || upcomingEvents[idx-1].date !== ev.date;
                return (
                  <div key={ev.id}>
                    {isFirst && (
                      <div className="flex items-center gap-2 py-1.5">
                        <span className="text-xs font-semibold text-gray-400 w-12 flex-shrink-0">
                          {ev.date === today ? "今日" : formatShortDate(ev.date)}
                        </span>
                        <div className="flex-1 h-px bg-gray-100" />
                      </div>
                    )}
                    <div className="flex items-center gap-2.5 py-2 pl-2">
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${s.dot}`} />
                      <span className="text-sm text-gray-800 font-medium truncate flex-1 min-w-0">
                        {ev.horseName}
                      </span>
                      <EventBadge title={ev.title} small />
                      <button
                        onClick={() => onDeleteEvent(ev.id)}
                        className="p-1 hover:bg-red-50 rounded flex-shrink-0"
                      >
                        <Trash2 size={13} className="text-gray-300 hover:text-red-400" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {showAddForm && (
        <AddEventModal
          selectedDate={selectedDate}
          horses={horses}
          onSave={(ev) => { onAddEvent(ev); setShowAddForm(false); }}
          onClose={() => setShowAddForm(false)}
        />
      )}
    </div>
  );
}
