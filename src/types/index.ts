// 数据类型定义

export interface DailyRecord {
  id: string;
  date: string;
  weight: number;
  waterIntake: number;
  steps: number;
  standCount: number;
  thesisWords: number;
}

export interface WaterRecord {
  id: string;
  date: string;
  time: string;
  type: string;
  amount: number;
  note: string;
}

export interface ActivityRecord {
  id: string;
  date: string;
  time: string;
  type: string;
  duration: number;
  note: string;
}

export interface ThesisRecord {
  id: string;
  date: string;
  chapter: string;
  words: number;
  note: string;
}

export interface Settings {
  gender: '男' | '女';
  age: number;
  height: number;
  baseWeight: number;
  waterGenderAdjustment: number;
  waterSedentaryAdjustment: number;
  thesisTargetWords: number;
  thesisDeadline: string;
  dailyStepsTarget: number;
  dailyStandTarget: number;
}

export interface AppData {
  settings: Settings;
  dailyRecords: DailyRecord[];
  waterRecords: WaterRecord[];
  activityRecords: ActivityRecord[];
  thesisRecords: ThesisRecord[];
}
