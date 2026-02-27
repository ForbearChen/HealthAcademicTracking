import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, TrendingDown, TrendingUp, Minus } from 'lucide-react';
import type { DailyRecord, Settings } from '@/types';

interface DailySectionProps {
  records: DailyRecord[];
  settings: Settings;
  onAdd: (record: Omit<DailyRecord, 'id'>) => void;
  onDelete: (id: string) => void;
  calculateWaterTarget: (weight: number) => number;
}

export function DailySection({ 
  records, 
  settings,
  onAdd, 
  onDelete,
  calculateWaterTarget 
}: DailySectionProps) {
  const [newRecord, setNewRecord] = useState({
    date: new Date().toISOString().split('T')[0],
    weight: settings.baseWeight,
  });

  // 按日期排序
  const sortedRecords = useMemo(() => {
    return [...records].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [records]);

  // 计算体重变化趋势
  const getWeightTrend = (currentIndex: number) => {
    if (currentIndex >= sortedRecords.length - 1) return null;
    const current = sortedRecords[currentIndex].weight;
    const previous = sortedRecords[currentIndex + 1].weight;
    const diff = current - previous;
    if (Math.abs(diff) < 0.1) return <Minus className="h-4 w-4 text-gray-400" />;
    if (diff > 0) return <TrendingUp className="h-4 w-4 text-red-500" />;
    return <TrendingDown className="h-4 w-4 text-green-500" />;
  };

  const handleAdd = () => {
    onAdd({
      date: newRecord.date,
      weight: newRecord.weight,
      waterIntake: 0,
      steps: 0,
      standCount: 0,
      thesisWords: 0,
    });

    // 清空表单
    setNewRecord({
      date: new Date().toISOString().split('T')[0],
      weight: newRecord.weight,
    });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">📅 每日记录</h2>

      <Card>
        <CardHeader>
          <CardTitle>添加今日记录</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>日期</Label>
            <Input 
              type="date" 
              value={newRecord.date}
              onChange={(e) => setNewRecord({ ...newRecord, date: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>当日体重 (kg)</Label>
            <Input 
              type="number" 
              step="0.1"
              value={newRecord.weight}
              onChange={(e) => setNewRecord({ ...newRecord, weight: Number(e.target.value) })}
            />
          </div>

          <div className="flex items-end">
            <Button onClick={handleAdd} className="w-full">添加记录</Button>
          </div>
        </CardContent>
      </Card>

      {/* 统计卡片 */}
      {sortedRecords.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-blue-50">
            <CardContent className="pt-4">
              <p className="text-sm text-gray-600">最新体重</p>
              <p className="text-2xl font-bold text-blue-600">
                {sortedRecords[0]?.weight.toFixed(1)} <span className="text-sm font-normal">kg</span>
              </p>
            </CardContent>
          </Card>
          <Card className="bg-green-50">
            <CardContent className="pt-4">
              <p className="text-sm text-gray-600">平均体重</p>
              <p className="text-2xl font-bold text-green-600">
                {(records.reduce((sum, r) => sum + r.weight, 0) / records.length).toFixed(1)} <span className="text-sm font-normal">kg</span>
              </p>
            </CardContent>
          </Card>
          <Card className="bg-orange-50">
            <CardContent className="pt-4">
              <p className="text-sm text-gray-600">当前饮水目标</p>
              <p className="text-2xl font-bold text-orange-600">
                {Math.round(calculateWaterTarget(sortedRecords[0]?.weight || settings.baseWeight))} <span className="text-sm font-normal">ml</span>
              </p>
            </CardContent>
          </Card>
          <Card className="bg-purple-50">
            <CardContent className="pt-4">
              <p className="text-sm text-gray-600">记录天数</p>
              <p className="text-2xl font-bold text-purple-600">
                {records.length} <span className="text-sm font-normal">天</span>
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>历史记录</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>日期</TableHead>
                  <TableHead>体重(kg)</TableHead>
                  <TableHead>趋势</TableHead>
                  <TableHead>饮水目标(ml)</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedRecords.map((record, index) => {
                  const waterTarget = calculateWaterTarget(record.weight);

                  return (
                    <TableRow key={record.id}>
                      <TableCell>{record.date}</TableCell>
                      <TableCell className="font-medium">{record.weight.toFixed(1)}</TableCell>
                      <TableCell>{getWeightTrend(index)}</TableCell>
                      <TableCell className="text-orange-600 font-medium">{Math.round(waterTarget)}</TableCell>
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
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {sortedRecords.length === 0 && (
            <p className="text-center text-gray-500 py-8">暂无记录，请添加第一条记录</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
