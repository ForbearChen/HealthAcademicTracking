import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Droplets, Footprints, Timer, BookOpen, TrendingUp, Calendar } from 'lucide-react';
import type { AppData } from '@/types';

interface DashboardSectionProps {
  data: AppData;
  calculateWaterTarget: (weight: number) => number;
  calculateThesisDailyTarget: () => number;
}

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export function DashboardSection({ data, calculateWaterTarget, calculateThesisDailyTarget }: DashboardSectionProps) {
  // 获取最近7天的日期
  const last7Days = useMemo(() => {
    const days: string[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push(date.toISOString().split('T')[0]);
    }
    return days;
  }, []);

  // 饮水数据
  const waterData = useMemo(() => {
    return last7Days.map(date => {
      const dailyRecords = data.dailyRecords.filter(r => r.date === date);
      const weight = dailyRecords[0]?.weight || data.settings.baseWeight;
      const target = calculateWaterTarget(weight);
      const actual = data.waterRecords
        .filter(r => r.date === date)
        .reduce((sum, r) => sum + r.amount, 0);
      
      return {
        date: date.slice(5),
        target,
        actual,
        completion: Math.min(100, Math.round((actual / target) * 100)),
      };
    });
  }, [last7Days, data, calculateWaterTarget]);

  // 活动数据
  const activityData = useMemo(() => {
    return last7Days.map(date => {
      const records = data.activityRecords.filter(r => r.date === date);
      const duration = records.reduce((sum, r) => sum + r.duration, 0);
      const count = records.length;
      
      return {
        date: date.slice(5),
        duration,
        count,
      };
    });
  }, [last7Days, data.activityRecords]);

  // 论文数据
  const thesisData = useMemo(() => {
    const totalWords = data.thesisRecords.reduce((sum, r) => sum + r.words, 0);
    const target = data.settings.thesisTargetWords;
    const progress = Math.min(100, Math.round((totalWords / target) * 100));
    const dailyTarget = calculateThesisDailyTarget();
    
    const dailyData = last7Days.map(date => {
      const words = data.thesisRecords
        .filter(r => r.date === date)
        .reduce((sum, r) => sum + r.words, 0);
      
      return {
        date: date.slice(5),
        words,
        target: dailyTarget,
      };
    });

    return { totalWords, target, progress, dailyTarget, dailyData };
  }, [last7Days, data.thesisRecords, data.settings, calculateThesisDailyTarget]);

  // 活动类型分布
  const activityTypeData = useMemo(() => {
    const typeCount: Record<string, number> = {};
    data.activityRecords.forEach(r => {
      typeCount[r.type] = (typeCount[r.type] || 0) + r.duration;
    });
    
    return Object.entries(typeCount)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [data.activityRecords]);

  // 今日概览
  const today = new Date().toISOString().split('T')[0];
  const todayStats = useMemo(() => {
    const dailyRecord = data.dailyRecords.find(r => r.date === today);
    const weight = dailyRecord?.weight || data.settings.baseWeight;
    
    const waterIntake = data.waterRecords
      .filter(r => r.date === today)
      .reduce((sum, r) => sum + r.amount, 0);
    const waterTarget = calculateWaterTarget(weight);
    
    const activities = data.activityRecords.filter(r => r.date === today);
    const activityDuration = activities.reduce((sum, r) => sum + r.duration, 0);
    const activityCount = activities.length;
    
    const thesisWords = data.thesisRecords
      .filter(r => r.date === today)
      .reduce((sum, r) => sum + r.words, 0);
    const thesisDailyTarget = calculateThesisDailyTarget();

    return {
      water: { intake: waterIntake, target: waterTarget },
      activity: { duration: activityDuration, count: activityCount },
      thesis: { words: thesisWords, target: thesisDailyTarget },
    };
  }, [data, today, calculateWaterTarget, calculateThesisDailyTarget]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">📊 数据看板</h2>

      {/* 今日概览 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-full">
                  <Droplets className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">今日饮水</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {todayStats.water.intake}<span className="text-sm font-normal">/{todayStats.water.target}ml</span>
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className={`text-lg font-bold ${
                  todayStats.water.intake >= todayStats.water.target ? 'text-green-600' : 'text-orange-500'
                }`}>
                  {Math.round((todayStats.water.intake / todayStats.water.target) * 100)}%
                </span>
              </div>
            </div>
            <Progress 
              value={Math.min(100, (todayStats.water.intake / todayStats.water.target) * 100)} 
              className="mt-3 h-2"
            />
          </CardContent>
        </Card>

        <Card className="bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-100 rounded-full">
                  <Timer className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">今日活动</p>
                  <p className="text-2xl font-bold text-green-600">
                    {todayStats.activity.duration}<span className="text-sm font-normal">分钟</span>
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-sm text-gray-500">{todayStats.activity.count}次</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-purple-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-100 rounded-full">
                  <BookOpen className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">今日写作</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {todayStats.thesis.words.toLocaleString()}<span className="text-sm font-normal">字</span>
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className={`text-lg font-bold ${
                  todayStats.thesis.words >= todayStats.thesis.target ? 'text-green-600' : 'text-orange-500'
                }`}>
                  {todayStats.thesis.target > 0 ? Math.round((todayStats.thesis.words / todayStats.thesis.target) * 100) : 0}%
                </span>
              </div>
            </div>
            <Progress 
              value={todayStats.thesis.target > 0 ? Math.min(100, (todayStats.thesis.words / todayStats.thesis.target) * 100) : 0} 
              className="mt-3 h-2"
            />
          </CardContent>
        </Card>
      </div>

      {/* 饮水趋势 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Droplets className="h-5 w-5 text-blue-500" />
            近7天饮水趋势
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={waterData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="actual" 
                  name="实际饮水" 
                  stroke="#3b82f6" 
                  fill="#3b82f6" 
                  fillOpacity={0.3}
                />
                <Area 
                  type="monotone" 
                  dataKey="target" 
                  name="目标" 
                  stroke="#94a3b8" 
                  fill="#94a3b8" 
                  fillOpacity={0.1}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* 活动趋势 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Footprints className="h-5 w-5 text-green-500" />
            近7天活动趋势
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="duration" name="活动时长(分钟)" fill="#22c55e" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* 论文进度 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-purple-500" />
            近7天写作进度
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={thesisData.dailyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="words" name="写作字数" fill="#8b5cf6" />
                <Bar dataKey="target" name="目标" fill="#e5e7eb" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* 活动类型分布 */}
      {activityTypeData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-orange-500" />
              活动类型分布
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={activityTypeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {activityTypeData.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 论文总体进度 */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50">
        <CardHeader>
          <CardTitle>论文总体进度</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-3xl font-bold text-purple-600">
                {thesisData.totalWords.toLocaleString()}
                <span className="text-lg text-gray-500"> / {thesisData.target.toLocaleString()} 字</span>
              </p>
              <p className="text-sm text-gray-500 mt-1">
                每日目标: {thesisData.dailyTarget.toLocaleString()} 字
              </p>
            </div>
            <div className="text-right">
              <p className="text-4xl font-bold text-purple-600">{thesisData.progress}%</p>
              <p className="text-sm text-gray-500">已完成</p>
            </div>
          </div>
          <Progress value={thesisData.progress} className="h-4" />
        </CardContent>
      </Card>
    </div>
  );
}
