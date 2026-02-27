import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { 
  Download, 
  Upload, 
  Trash2, 
  CloudUpload, 
  CloudDownload, 
  Settings2,
  AlertTriangle,
  Check,
  RefreshCw,
  HelpCircle
} from 'lucide-react';
import type { Settings } from '@/types';

interface SettingsSectionProps {
  settings: Settings;
  onUpdate: (settings: Partial<Settings>) => void;
  gistToken: string;
  gistId: string;
  isSyncing: boolean;
  lastSyncTime: string | null;
  onExport: () => boolean;
  onImport: (jsonString: string) => boolean;
  onClear: () => void;
  onSaveGistConfig: (token: string, id: string) => void;
  onUploadToGist: () => Promise<boolean>;
  onDownloadFromGist: () => Promise<boolean>;
}

export function SettingsSection({ 
  settings, 
  onUpdate,
  gistToken,
  gistId,
  isSyncing,
  lastSyncTime,
  onExport,
  onImport,
  onClear,
  onSaveGistConfig,
  onUploadToGist,
  onDownloadFromGist,
}: SettingsSectionProps) {
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const [gistDialogOpen, setGistDialogOpen] = useState(false);
  const [importContent, setImportContent] = useState('');
  const [localGistToken, setLocalGistToken] = useState(gistToken);
  const [localGistId, setLocalGistId] = useState(gistId);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 同步本地状态与 props
  useEffect(() => {
    setLocalGistToken(gistToken);
  }, [gistToken]);

  useEffect(() => {
    setLocalGistId(gistId);
  }, [gistId]);

  // 处理导出
  const handleExport = () => {
    const success = onExport();
    if (success) {
      toast.success('数据已导出', { description: '备份文件已下载到本地' });
    }
  };

  // 处理文件选择
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setImportContent(content);
      };
      reader.readAsText(file);
    }
  };

  // 处理导入
  const handleImport = () => {
    if (!importContent.trim()) {
      toast.error('请先选择文件或粘贴数据');
      return;
    }
    const success = onImport(importContent);
    if (success) {
      toast.success('数据导入成功');
      setImportDialogOpen(false);
      setImportContent('');
    } else {
      toast.error('导入失败', { description: '数据格式不正确' });
    }
  };

  // 处理清空
  const handleClear = () => {
    onClear();
    setClearDialogOpen(false);
    toast.success('所有数据已清空');
  };

  // 保存Gist配置
  const handleSaveGistConfig = () => {
    onSaveGistConfig(localGistToken, localGistId);
    toast.success('云同步配置已保存');
    setGistDialogOpen(false);
  };

  // 上传到云端
  const handleUpload = async () => {
    if (!localGistToken) {
      toast.error('请先配置 GitHub Token');
      return;
    }
    const success = await onUploadToGist();
    if (success) {
      toast.success('数据已同步到云端');
    } else {
      toast.error('同步失败', { description: '请检查 Token 和网络连接' });
    }
  };

  // 从云端下载
  const handleDownload = async () => {
    if (!localGistToken || !localGistId) {
      toast.error('请先配置 GitHub Token 和 Gist ID');
      return;
    }
    const success = await onDownloadFromGist();
    if (success) {
      toast.success('数据已从云端恢复');
    } else {
      toast.error('恢复失败', { description: '请检查 Token、Gist ID 和网络连接' });
    }
  };

  // 格式化上次同步时间
  const formatSyncTime = (time: string | null) => {
    if (!time) return '从未同步';
    const date = new Date(time);
    return date.toLocaleString('zh-CN');
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">⚙️ 参数设置</h2>

      {/* 个人信息 */}
      <Card>
        <CardHeader>
          <CardTitle>👤 个人信息</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>性别</Label>
            <Select 
              value={settings.gender} 
              onValueChange={(v) => onUpdate({ gender: v as '男' | '女', waterGenderAdjustment: v === '男' ? 200 : 0 })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="男">男</SelectItem>
                <SelectItem value="女">女</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>年龄</Label>
            <Input 
              type="number" 
              value={settings.age} 
              onChange={(e) => onUpdate({ age: Number(e.target.value) })}
            />
          </div>

          <div className="space-y-2">
            <Label>身高 (cm)</Label>
            <Input 
              type="number" 
              value={settings.height} 
              onChange={(e) => onUpdate({ height: Number(e.target.value) })}
            />
          </div>

          <div className="space-y-2">
            <Label>基础体重 (kg)</Label>
            <Input 
              type="number" 
              value={settings.baseWeight} 
              onChange={(e) => onUpdate({ baseWeight: Number(e.target.value) })}
            />
          </div>
        </CardContent>
      </Card>

      {/* 饮水目标 */}
      <Card>
        <CardHeader>
          <CardTitle>💧 饮水目标</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>性别调整 (ml)</Label>
            <Input 
              type="number" 
              value={settings.waterGenderAdjustment} 
              onChange={(e) => onUpdate({ waterGenderAdjustment: Number(e.target.value) })}
            />
            <p className="text-xs text-gray-500">男性+200ml，女性+0ml</p>
          </div>

          <div className="space-y-2">
            <Label>久坐调整 (ml)</Label>
            <Input 
              type="number" 
              value={settings.waterSedentaryAdjustment} 
              onChange={(e) => onUpdate({ waterSedentaryAdjustment: Number(e.target.value) })}
            />
            <p className="text-xs text-gray-500">久坐办公额外补充</p>
          </div>
        </CardContent>
      </Card>

      {/* 活动目标 */}
      <Card>
        <CardHeader>
          <CardTitle>🚶 活动目标</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>每日步数目标</Label>
            <Input 
              type="number" 
              value={settings.dailyStepsTarget} 
              onChange={(e) => onUpdate({ dailyStepsTarget: Number(e.target.value) })}
            />
          </div>

          <div className="space-y-2">
            <Label>每日站立目标 (次)</Label>
            <Input 
              type="number" 
              value={settings.dailyStandTarget} 
              onChange={(e) => onUpdate({ dailyStandTarget: Number(e.target.value) })}
            />
          </div>
        </CardContent>
      </Card>

      {/* 论文目标 */}
      <Card>
        <CardHeader>
          <CardTitle>📝 论文目标</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>目标总字数</Label>
            <Input 
              type="number" 
              value={settings.thesisTargetWords} 
              onChange={(e) => onUpdate({ thesisTargetWords: Number(e.target.value) })}
            />
          </div>

          <div className="space-y-2">
            <Label>计划完成日期</Label>
            <Input 
              type="date" 
              value={settings.thesisDeadline} 
              onChange={(e) => onUpdate({ thesisDeadline: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      {/* 数据管理 */}
      <Card>
        <CardHeader>
          <CardTitle>💾 数据管理</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 本地备份 */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-700">本地备份</h4>
            <div className="flex flex-wrap gap-3">
              <Button onClick={handleExport} variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                导出数据
              </Button>
              <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Upload className="h-4 w-4" />
                    导入数据
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>导入数据</DialogTitle>
                    <DialogDescription>
                      选择之前导出的备份文件，或粘贴 JSON 数据内容
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>选择文件</Label>
                      <Input 
                        type="file" 
                        accept=".json"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>或粘贴数据</Label>
                      <textarea
                        className="w-full h-32 p-3 border rounded-md text-sm font-mono"
                        placeholder="粘贴 JSON 数据..."
                        value={importContent}
                        onChange={(e) => setImportContent(e.target.value)}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setImportDialogOpen(false)}>取消</Button>
                    <Button onClick={handleImport}>确认导入</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* 云同步 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-gray-700">云同步 (GitHub Gist)</h4>
              <span className="text-xs text-gray-500">
                上次同步: {formatSyncTime(lastSyncTime)}
              </span>
            </div>
            <div className="flex flex-wrap gap-3">
              <Dialog open={gistDialogOpen} onOpenChange={setGistDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Settings2 className="h-4 w-4" />
                    配置
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>配置云同步</DialogTitle>
                    <DialogDescription>
                      使用 GitHub Gist 进行数据同步。需要创建 Personal Access Token。
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>GitHub Personal Access Token</Label>
                      <Input 
                        type="password"
                        placeholder="ghp_xxxxxxxxxxxx"
                        value={localGistToken}
                        onChange={(e) => setLocalGistToken(e.target.value)}
                      />
                      <p className="text-xs text-gray-500">
                        在 GitHub Settings → Developer settings → Personal access tokens 中创建
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label>Gist ID (可选)</Label>
                      <Input 
                        placeholder="首次同步留空，系统会自动创建"
                        value={localGistId}
                        onChange={(e) => setLocalGistId(e.target.value)}
                      />
                      <p className="text-xs text-gray-500">
                        如果已有 Gist，填写 ID 即可同步到该 Gist
                      </p>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setGistDialogOpen(false)}>取消</Button>
                    <Button onClick={handleSaveGistConfig}>
                      <Check className="h-4 w-4 mr-1" />
                      保存配置
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Button 
                onClick={handleUpload} 
                disabled={isSyncing || !localGistToken}
                variant="outline" 
                className="gap-2"
              >
                {isSyncing ? <RefreshCw className="h-4 w-4 animate-spin" /> : <CloudUpload className="h-4 w-4" />}
                上传到云端
              </Button>

              <Button 
                onClick={handleDownload} 
                disabled={isSyncing || !localGistToken || !localGistId}
                variant="outline" 
                className="gap-2"
              >
                {isSyncing ? <RefreshCw className="h-4 w-4 animate-spin" /> : <CloudDownload className="h-4 w-4" />}
                从云端恢复
              </Button>
            </div>
            <div className="bg-blue-50 p-3 rounded-md text-sm text-blue-700 flex items-start gap-2">
              <HelpCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">如何使用云同步？</p>
                <ol className="list-decimal list-inside mt-1 space-y-1 text-xs">
                  <li>访问 GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)</li>
                  <li>点击 "Generate new token"，勾选 "gist" 权限</li>
                  <li>复制生成的 Token，粘贴到上面的配置中</li>
                  <li>点击"上传到云端"即可同步数据</li>
                </ol>
              </div>
            </div>
          </div>

          {/* 危险操作 */}
          <div className="space-y-3">
            <h4 className="font-medium text-red-600">危险操作</h4>
            <Dialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="destructive" className="gap-2">
                  <Trash2 className="h-4 w-4" />
                  清空所有数据
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-red-600">
                    <AlertTriangle className="h-5 w-5" />
                    确认清空所有数据？
                  </DialogTitle>
                  <DialogDescription>
                    此操作将删除所有记录，包括饮水、活动、论文进度等数据。删除后无法恢复，请先导出备份！
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2">
                  <Button variant="outline" onClick={() => setClearDialogOpen(false)}>取消</Button>
                  <Button variant="destructive" onClick={handleClear}>
                    确认清空
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
