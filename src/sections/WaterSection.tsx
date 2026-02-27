import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2 } from 'lucide-react';
import type { WaterRecord } from '@/types';

interface WaterSectionProps {
  records: WaterRecord[];
  onAdd: (record: Omit<WaterRecord, 'id'>) => void;
  onDelete: (id: string) => void;
}

const drinkTypes = ['白开水', '茶水', '咖啡', '矿泉水', '果汁', '牛奶', '其他'];

export function WaterSection({ records, onAdd, onDelete }: WaterSectionProps) {
  const [newRecord, setNewRecord] = useState({
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    type: '白开水',
    amount: 300,
    note: '',
  });

  const handleAdd = () => {
    onAdd({ ...newRecord });
    setNewRecord({
      date: newRecord.date,
      time: new Date().toTimeString().slice(0, 5),
      type: '白开水',
      amount: 300,
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
      acc[record.date] = 0;
    }
    acc[record.date] += record.amount;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">💧 饮水明细</h2>

      <Card>
        <CardHeader>
          <CardTitle>添加饮水记录</CardTitle>
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
            <Label>饮品类型</Label>
            <Select 
              value={newRecord.type}
              onValueChange={(v) => setNewRecord({ ...newRecord, type: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {drinkTypes.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>量 (ml)</Label>
            <Input 
              type="number" 
              value={newRecord.amount}
              onChange={(e) => setNewRecord({ ...newRecord, amount: Number(e.target.value) })}
            />
          </div>

          <div className="flex items-end">
            <Button onClick={handleAdd} className="w-full">添加</Button>
          </div>
        </CardContent>
      </Card>

      {/* 每日汇总 */}
      {Object.keys(dailySummary).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>每日汇总</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {Object.entries(dailySummary)
                .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
                .slice(0, 7)
                .map(([date, total]) => (
                  <div key={date} className="bg-blue-50 px-3 py-2 rounded-lg">
                    <span className="text-sm text-gray-600">{date}</span>
                    <span className="ml-2 font-bold text-blue-600">{total}ml</span>
                  </div>
                ))}
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
                  <TableHead>时间</TableHead>
                  <TableHead>饮品类型</TableHead>
                  <TableHead>量(ml)</TableHead>
                  <TableHead>备注</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>{record.date}</TableCell>
                    <TableCell>{record.time}</TableCell>
                    <TableCell>{record.type}</TableCell>
                    <TableCell>{record.amount}</TableCell>
                    <TableCell>{record.note || '-'}</TableCell>
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
            <p className="text-center text-gray-500 py-8">暂无记录</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
