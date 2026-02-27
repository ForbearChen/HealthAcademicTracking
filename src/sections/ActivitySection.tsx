import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2 } from 'lucide-react';
import type { ActivityRecord } from '@/types';

interface ActivitySectionProps {
  records: ActivityRecord[];
  onAdd: (record: Omit<ActivityRecord, 'id'>) => void;
  onDelete: (id: string) => void;
}

const activityTypes = [
  { value: '站立', label: '站立', icon: '🧍' },
  { value: '走动/散步', label: '走动/散步', icon: '🚶' },
  { value: '拉伸', label: '拉伸', icon: '🧘' },
  { value: '深蹲', label: '深蹲', icon: '🏋️' },
  { value: '臀部训练', label: '臀部训练', icon: '🍑' },
  { value: '其他运动', label: '其他运动', icon: '💪' },
];

export function ActivitySection({ records, onAdd, onDelete }: ActivitySectionProps) {
  const [newRecord, setNewRecord] = useState({
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    type: '站立',
    duration: 5,
    note: '',
  });

  const handleAdd = () => {
    onAdd({ ...newRecord });
    setNewRecord({
      date: newRecord.date,
      time: new Date().toTimeString().slice(0, 5),
      type: '站立',
      duration: 5,
      note: '',
    });
  };

  // 按日期排序
  const sortedRecords = [...records].sort((a, b) => {
    const dateCompare = new Date(b.date).getTime() - new Date(a.date).getTime();
    if (dateCompare !== 0) return dateCompare;
    return a.time.localeCompare(b.time);
  });

  // 按日期分组统计
  const dailySummary = sortedRecords.reduce((acc, record) => {
    if (!acc[record.date]) {
      acc[record.date] = { count: 0, duration: 0 };
    }
    acc[record.date].count += 1;
    acc[record.date].duration += record.duration;
    return acc;
  }, {} as Record<string, { count: number; duration: number }>);

  // 按类型统计
  const typeSummary = sortedRecords.reduce((acc, record) => {
    if (!acc[record.type]) {
      acc[record.type] = 0;
    }
    acc[record.type] += record.duration;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">🏃 活动记录</h2>

      <Card>
        <CardHeader>
          <CardTitle>添加活动记录</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="space-y-2">
            <Label>日期</Label>
            <Input 
              type="date" 
              value={newRecord.date}
              onChange={(e) => setNewRecord({ ...newRecord, date: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>时间</Label>
            <Input 
              type="time" 
              value={newRecord.time}
              onChange={(e) => setNewRecord({ ...newRecord, time: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>活动类型</Label>
            <Select 
              value={newRecord.type}
              onValueChange={(v) => setNewRecord({ ...newRecord, type: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {activityTypes.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.icon} {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>时长 (分钟)</Label>
            <Input 
              type="number" 
              min={1}
              value={newRecord.duration}
              onChange={(e) => setNewRecord({ ...newRecord, duration: Number(e.target.value) })}
            />
          </div>

          <div className="flex items-end">
            <Button onClick={handleAdd} className="w-full">添加</Button>
          </div>
        </CardContent>
      </Card>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 每日汇总 */}
        {Object.keys(dailySummary).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>每日汇总</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {Object.entries(dailySummary)
                  .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
                  .slice(0, 7)
                  .map(([date, stats]) => (
                    <div key={date} className="flex justify-between items-center bg-green-50 px-3 py-2 rounded-lg">
                      <span className="text-sm text-gray-600">{date}</span>
                      <div className="text-right">
                        <span className="text-xs text-gray-500">{stats.count}次</span>
                        <span className="ml-2 font-bold text-green-600">{stats.duration}分钟</span>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 类型统计 */}
        {Object.keys(typeSummary).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>类型统计</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(typeSummary)
                  .sort((a, b) => b[1] - a[1])
                  .map(([type, duration]) => {
                    const typeInfo = activityTypes.find(t => t.value === type);
                    return (
                      <div key={type} className="flex justify-between items-center bg-orange-50 px-3 py-2 rounded-lg">
                        <span>{typeInfo?.icon} {type}</span>
                        <span className="font-bold text-orange-600">{duration}分钟</span>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

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
                  <TableHead>时间</TableHead>
                  <TableHead>活动类型</TableHead>
                  <TableHead>时长(分钟)</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedRecords.map((record) => {
                  const typeInfo = activityTypes.find(t => t.value === record.type);
                  return (
                    <TableRow key={record.id}>
                      <TableCell>{record.date}</TableCell>
                      <TableCell>{record.time}</TableCell>
                      <TableCell>{typeInfo?.icon} {record.type}</TableCell>
                      <TableCell>{record.duration}</TableCell>
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
            <p className="text-center text-gray-500 py-8">暂无记录，添加一条活动记录吧！</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
