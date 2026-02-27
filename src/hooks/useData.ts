import { useState, useEffect, useCallback } from 'react';
import type { AppData, Settings, DailyRecord, WaterRecord, ActivityRecord, ThesisRecord } from '@/types';

const STORAGE_KEY = 'health-academic-tracker-data';
const GIST_TOKEN_KEY = 'health-tracker-gist-token';
const GIST_ID_KEY = 'health-tracker-gist-id';

const defaultSettings: Settings = {
  gender: '男',
  age: 30,
  height: 180,
  baseWeight: 80,
  waterGenderAdjustment: 200,
  waterSedentaryAdjustment: 300,
  thesisTargetWords: 80000,
  thesisDeadline: '2026-06-30',
  dailyStepsTarget: 8000,
  dailyStandTarget: 8,
};

const defaultData: AppData = {
  settings: defaultSettings,
  dailyRecords: [],
  waterRecords: [],
  activityRecords: [],
  thesisRecords: [],
};

export function useData() {
  const [data, setData] = useState<AppData>(defaultData);
  const [isLoaded, setIsLoaded] = useState(false);
  const [gistToken, setGistToken] = useState<string>('');
  const [gistId, setGistId] = useState<string>('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);

  // 从localStorage加载数据
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setData({ ...defaultData, ...parsed });
      } catch (e) {
        console.error('Failed to parse stored data:', e);
      }
    }
    // 加载Gist配置
    const token = localStorage.getItem(GIST_TOKEN_KEY) || '';
    const id = localStorage.getItem(GIST_ID_KEY) || '';
    const syncTime = localStorage.getItem('health-tracker-last-sync');
    setGistToken(token);
    setGistId(id);
    setLastSyncTime(syncTime);
    setIsLoaded(true);
  }, []);

  // 保存到localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  }, [data, isLoaded]);

  // 更新设置
  const updateSettings = useCallback((newSettings: Partial<Settings>) => {
    setData(prev => ({
      ...prev,
      settings: { ...prev.settings, ...newSettings },
    }));
  }, []);

  // 添加每日记录
  const addDailyRecord = useCallback((record: Omit<DailyRecord, 'id'>) => {
    setData(prev => ({
      ...prev,
      dailyRecords: [...prev.dailyRecords, { ...record, id: Date.now().toString() }],
    }));
  }, []);

  // 更新每日记录
  const updateDailyRecord = useCallback((id: string, updates: Partial<DailyRecord>) => {
    setData(prev => ({
      ...prev,
      dailyRecords: prev.dailyRecords.map(r => r.id === id ? { ...r, ...updates } : r),
    }));
  }, []);

  // 删除每日记录
  const deleteDailyRecord = useCallback((id: string) => {
    setData(prev => ({
      ...prev,
      dailyRecords: prev.dailyRecords.filter(r => r.id !== id),
    }));
  }, []);

  // 添加饮水记录
  const addWaterRecord = useCallback((record: Omit<WaterRecord, 'id'>) => {
    setData(prev => ({
      ...prev,
      waterRecords: [...prev.waterRecords, { ...record, id: Date.now().toString() }],
    }));
  }, []);

  // 删除饮水记录
  const deleteWaterRecord = useCallback((id: string) => {
    setData(prev => ({
      ...prev,
      waterRecords: prev.waterRecords.filter(r => r.id !== id),
    }));
  }, []);

  // 添加活动记录
  const addActivityRecord = useCallback((record: Omit<ActivityRecord, 'id'>) => {
    setData(prev => ({
      ...prev,
      activityRecords: [...prev.activityRecords, { ...record, id: Date.now().toString() }],
    }));
  }, []);

  // 删除活动记录
  const deleteActivityRecord = useCallback((id: string) => {
    setData(prev => ({
      ...prev,
      activityRecords: prev.activityRecords.filter(r => r.id !== id),
    }));
  }, []);

  // 添加论文记录
  const addThesisRecord = useCallback((record: Omit<ThesisRecord, 'id'>) => {
    setData(prev => ({
      ...prev,
      thesisRecords: [...prev.thesisRecords, { ...record, id: Date.now().toString() }],
    }));
  }, []);

  // 删除论文记录
  const deleteThesisRecord = useCallback((id: string) => {
    setData(prev => ({
      ...prev,
      thesisRecords: prev.thesisRecords.filter(r => r.id !== id),
    }));
  }, []);

  // 计算饮水目标
  const calculateWaterTarget = useCallback((weight: number) => {
    return weight * 35 + data.settings.waterGenderAdjustment + data.settings.waterSedentaryAdjustment;
  }, [data.settings]);

  // 计算论文每日目标
  const calculateThesisDailyTarget = useCallback(() => {
    const today = new Date();
    const deadline = new Date(data.settings.thesisDeadline);
    const remainingDays = Math.max(0, Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
    const totalWords = data.thesisRecords.reduce((sum, r) => sum + r.words, 0);
    const remainingWords = data.settings.thesisTargetWords - totalWords;
    return remainingDays > 0 ? Math.ceil(remainingWords / remainingDays) : 0;
  }, [data.settings, data.thesisRecords]);

  // 按日期汇总饮水
  const getWaterByDate = useCallback((date: string) => {
    return data.waterRecords
      .filter(r => r.date === date)
      .reduce((sum, r) => sum + r.amount, 0);
  }, [data.waterRecords]);

  // 按日期汇总步数
  const getStepsByDate = useCallback((date: string) => {
    return data.activityRecords
      .filter(r => r.date === date && r.type === '走动/散步')
      .reduce((sum, r) => sum + r.duration * 100, 0);
  }, [data.activityRecords]);

  // 按日期统计站立次数
  const getStandCountByDate = useCallback((date: string) => {
    return data.activityRecords.filter(r => r.date === date).length;
  }, [data.activityRecords]);

  // 按日期汇总论文字数
  const getThesisWordsByDate = useCallback((date: string) => {
    return data.thesisRecords
      .filter(r => r.date === date)
      .reduce((sum, r) => sum + r.words, 0);
  }, [data.thesisRecords]);

  // ========== 数据导出/导入功能 ==========

  // 导出数据为JSON文件
  const exportData = useCallback(() => {
    const exportData = {
      ...data,
      exportTime: new Date().toISOString(),
      version: '1.0',
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `health-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return true;
  }, [data]);

  // 从JSON文件导入数据
  const importData = useCallback((jsonString: string): boolean => {
    try {
      const imported = JSON.parse(jsonString);
      if (imported.settings && imported.dailyRecords && imported.waterRecords) {
        setData({
          settings: { ...defaultSettings, ...imported.settings },
          dailyRecords: imported.dailyRecords || [],
          waterRecords: imported.waterRecords || [],
          activityRecords: imported.activityRecords || [],
          thesisRecords: imported.thesisRecords || [],
        });
        return true;
      }
      return false;
    } catch (e) {
      console.error('Import failed:', e);
      return false;
    }
  }, []);

  // 清空所有数据
  const clearAllData = useCallback(() => {
    setData(defaultData);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  // ========== 云同步功能（GitHub Gist） ==========

  // 保存Gist配置
  const saveGistConfig = useCallback((token: string, id: string) => {
    setGistToken(token);
    setGistId(id);
    localStorage.setItem(GIST_TOKEN_KEY, token);
    localStorage.setItem(GIST_ID_KEY, id);
  }, []);

  // 上传到Gist
  const uploadToGist = useCallback(async (): Promise<boolean> => {
    if (!gistToken) return false;
    
    setIsSyncing(true);
    try {
      const syncData = {
        ...data,
        syncTime: new Date().toISOString(),
        version: '1.0',
      };

      const response = await fetch(`https://api.github.com/gists${gistId ? `/${gistId}` : ''}`, {
        method: gistId ? 'PATCH' : 'POST',
        headers: {
          'Authorization': `token ${gistToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: 'Health & Academic Tracker Data',
          public: false,
          files: {
            'health-tracker-data.json': {
              content: JSON.stringify(syncData, null, 2),
            },
          },
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (!gistId) {
          setGistId(result.id);
          localStorage.setItem(GIST_ID_KEY, result.id);
        }
        const now = new Date().toISOString();
        setLastSyncTime(now);
        localStorage.setItem('health-tracker-last-sync', now);
        return true;
      }
      return false;
    } catch (e) {
      console.error('Upload to Gist failed:', e);
      return false;
    } finally {
      setIsSyncing(false);
    }
  }, [data, gistToken, gistId]);

  // 从Gist下载
  const downloadFromGist = useCallback(async (): Promise<boolean> => {
    if (!gistToken || !gistId) return false;

    setIsSyncing(true);
    try {
      const response = await fetch(`https://api.github.com/gists/${gistId}`, {
        headers: {
          'Authorization': `token ${gistToken}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        const content = result.files['health-tracker-data.json']?.content;
        if (content) {
          const syncData = JSON.parse(content);
          setData({
            settings: { ...defaultSettings, ...syncData.settings },
            dailyRecords: syncData.dailyRecords || [],
            waterRecords: syncData.waterRecords || [],
            activityRecords: syncData.activityRecords || [],
            thesisRecords: syncData.thesisRecords || [],
          });
          const now = new Date().toISOString();
          setLastSyncTime(now);
          localStorage.setItem('health-tracker-last-sync', now);
          return true;
        }
      }
      return false;
    } catch (e) {
      console.error('Download from Gist failed:', e);
      return false;
    } finally {
      setIsSyncing(false);
    }
  }, [gistToken, gistId]);

  return {
    data,
    isLoaded,
    gistToken,
    gistId,
    isSyncing,
    lastSyncTime,
    updateSettings,
    addDailyRecord,
    updateDailyRecord,
    deleteDailyRecord,
    addWaterRecord,
    deleteWaterRecord,
    addActivityRecord,
    deleteActivityRecord,
    addThesisRecord,
    deleteThesisRecord,
    calculateWaterTarget,
    calculateThesisDailyTarget,
    getWaterByDate,
    getStepsByDate,
    getStandCountByDate,
    getThesisWordsByDate,
    exportData,
    importData,
    clearAllData,
    saveGistConfig,
    uploadToGist,
    downloadFromGist,
  };
}
