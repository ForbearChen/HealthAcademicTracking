import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Trash2, AlertCircle } from 'lucide-react';
import type { ThesisRecord, Settings } from '@/types';

interface ThesisSectionProps {
  records: ThesisRecord[];
  settings: Settings;
  onAdd: (record: Omit<ThesisRecord, 'id'>) => void;
  onDelete: (id: string) => void;
}

export function ThesisSection({ records, settings, onAdd, onDelete }: ThesisSectionProps) {
  const [newRecord, setNewRecord] = useState({
    date: new Date().toISOString().split('T')[0],
    chapter: '',
    words: 0,
    note: '',
  });

  const handleAdd = () => {
    onAdd({ ...newRecord });
    setNewRecord({
      date: newRecord.date,
      chapter: '',
      words: 0,
      note: '',
    });
  };

  // 按日期排序
  const sortedRecords = [...records].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  // 计算统计数据
  const stats = useMemo(() => {
    const totalWords = records.reduce((sum, r) => sum + r.words, 0);
    const progress = Math.min(100, Math.round((totalWords / settings.thesisTargetWords) * 100));
    
    const today = new Date();
    const deadline = new Date(settings.thesisDeadline);
    const remainingDays = Math.max(0, Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
    
    const remainingWords = settings.thesisTargetWords - totalWords;
    const dailyTarget = remainingDays > 0 && remainingWords > 0 
      ? Math.ceil(remainingWords / remainingDays) 
      : 0;

    // 计算最近7天平均
    const last7Days = records.filter(r => {
      const recordDate = new Date(r.date);
      const daysDiff = Math.ceil((today.getTime() - recordDate.getTime()) / (1000 * 60 * 60 * 24));
      return daysDiff <= 7;
    });
    const avg7Days = last7Days.length > 0 
      ? Math.round(last7Days.reduce((sum, r) => sum + r.words, 0) / 7)
      : 0;

    return {
      totalWords,
      progress,
      remainingDays,
      remainingWords,
      dailyTarget,
      avg7Days,
    };
  }, [records, settings]);

  // 按日期分组统计
  const dailySummary = sortedRecords.reduce((acc, record) => {
    if (!acc[record.date]) {
      acc[record.date] = 0;
    }
    acc[record.date] += record.words;
    return acc;
  }, {} as Record<string, number>);

  // 进度状态
  const getProgressStatus = () => {
    if (stats.progress >= 100) return { text: '已完成！🎉', color: 'text-green-600' };
    if (stats.progress >= 75) return { text: '冲刺阶段！💪', color: 'text-blue-600' };
    if (stats.progress >= 50) return { text: '过半了，继续加油！', color: 'text-yellow-600' };
    if (stats.progress >= 25) return { text: '稳步进行中', color: 'text-orange-600' };
    return { text: '刚开始，打好基础', color: 'text-gray-600' };
  };

  const progressStatus = getProgressStatus();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">📚 论文进度</h2>

      {/* 总体进度卡片 */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            总体进度
            <span className={`text-sm font-normal ${progressStatus.color}`}>
              {progressStatus.text}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between text-sm">
            <span>目标: {settings.thesisTargetWords.toLocaleString()} 字</span>
            <span className="font-bold">{stats.progress}%</span>
          </div>
          <Progress value={stats.progress} className="h-3" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
            <div className="bg-white rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {stats.totalWords.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500">已完成字数</div>
            </div>
            <div className="bg-white rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-orange-600">
                {stats.remainingWords.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500">剩余字数</div>
            </div>
            <div className="bg-white rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {stats.remainingDays}
              </div>
              <div className="text-xs text-gray-500">剩余天数</div>
            </div>
            <div className="bg-white rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-green-600">
                {stats.dailyTarget.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500">每日目标</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 添加记录 */}
      <Card>
        <CardHeader>
          <CardTitle>添加写作记录</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label>日期</Label>
            <Input 
              type="date" 
              value={newRecord.date}
              onChange={(e) => setNewRecord({ ...newRecord, date: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>章节/内容</Label>
            <Input 
              placeholder="如：第一章绪论"
              value={newRecord.chapter}
              onChange={(e) => setNewRecord({ ...newRecord, chapter: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>字数</Label>
            <Input 
              type="number" 
              min={0}
              placeholder={`建议: ${stats.dailyTarget}字`}
              value={newRecord.words || ''}
              onChange={(e) => setNewRecord({ ...newRecord, words: Number(e.target.value) })}
            />
          </div>

          <div className="flex items-end">
            <Button onClick={handleAdd} className="w-full">添加</Button>
          </div>
        </CardContent>
      </Card>

      {/* 每日写作统计 */}
      {Object.keys(dailySummary).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>每日写作统计</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {Object.entries(dailySummary)
                .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
                .slice(0, 14)
                .map(([date, words]) => {
                  const isMetTarget = words >= stats.dailyTarget;
                  return (
                    <div 
                      key={date} 
                      className={`flex justify-between items-center px-3 py-2 rounded-lg ${
                        isMetTarget ? 'bg-green-50' : 'bg-yellow-50'
                      }`}
                    >
                      <span className="text-sm text-gray-600">{date}</span>
                      <div className="text-right">
                        <span className={`font-bold ${isMetTarget ? 'text-green-600' : 'text-yellow-600'}`}>
                          {words.toLocaleString()}字
                        </span>
                        {stats.dailyTarget > 0 && (
                          <span className="ml-2 text-xs text-gray-500">
                            {Math.round((words / stats.dailyTarget) * 100)}%
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 最近7天平均 */}
      {stats.avg7Days > 0 && (
        <Card className={stats.avg7Days >= stats.dailyTarget ? 'bg-green-50' : 'bg-yellow-50'}>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                <span>最近7天平均: <strong>{stats.avg7Days.toLocaleString()}字/天</strong></span>
              </div>
              <span className={stats.avg7Days >= stats.dailyTarget ? 'text-green-600' : 'text-yellow-600'}>
                {stats.avg7Days >= stats.dailyTarget ? '达标 ✓' : '未达标'}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>详细记录</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>日期</TableHead>
                  <TableHead>章节/内容</TableHead>
                  <TableHead>字数</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>{record.date}</TableCell>
                    <TableCell>{record.chapter || '-'}</TableCell>
                    <TableCell className="font-medium">{record.words.toLocaleString()}</TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => onDelete(record.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {sortedRecords.length === 0 && (
            <p className="text-center text-gray-500 py-8">暂无记录，开始写作吧！</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
