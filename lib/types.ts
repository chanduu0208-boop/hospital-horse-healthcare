export type HealthStatus = "術後入院" | "譲渡馬";

export type ExerciseStatus = "引き運動" | "完全舎飼い" | "サンシャインパドック";

export interface HorseRecord {
  id: string;
  date: string;
  condition: string;
  notes?: string;
  veterinarian?: string;
  treatment?: string;
  medication?: string;
}

export interface WeightRecord {
  id: string;
  date: string;   // YYYY-MM-DD
  weight: number; // kg
}

export interface TemperatureRecord {
  id: string;
  date: string;        // YYYY-MM-DD
  time?: string;        // HH:mm
  temperature: number;  // ℃
  notes?: string;
}

export interface BloodTestItemValue {
  key: string;     // 例: "WBC"
  label: string;   // 表示名 例: "白血球数"
  value: number;
  unit?: string;
  flagged?: boolean; // 要注意（基準値外など）
}

export interface BloodTestRecord {
  id: string;
  date: string; // YYYY-MM-DD
  items: BloodTestItemValue[];
  notes?: string;
  photo?: string; // 検査票の参考写真（data URL）
}

export interface FeedingRecord {
  id: string;
  date: string;     // この内容を開始した日 (YYYY-MM-DD)
  content: string;  // 給餌内容
  notes?: string;
}

export interface SurgeryRecord {
  id: string;
  date: string;     // 手術日 (YYYY-MM-DD)
  notes?: string;   // 術式・内容など
}

export interface CalendarEvent {
  id: string;
  date: string;       // YYYY-MM-DD
  horseId: string;
  horseName: string;
  title: string;
  notes?: string;
  sourceKey?: string; // 自動生成イベントの識別子
}

export interface Horse {
  id: string;
  name: string;
  status: HealthStatus;
  exercise: ExerciseStatus;
  firstVisitDate: string;
  diagnosis: string;
  pastHistory?: string;     // 既往歴
  visitCheckedDate?: string;
  fluidTherapy?: boolean; // 補液中かどうか
  fluidRate?: string;     // 流速（自由入力、例：60ml/h）
  notes?: string;
  records: HorseRecord[];
  weightRecords?: WeightRecord[];
  temperatureRecords?: TemperatureRecord[];
  bloodTestRecords?: BloodTestRecord[];
  feedingRecords?: FeedingRecord[];
  surgeryRecords?: SurgeryRecord[];
}
