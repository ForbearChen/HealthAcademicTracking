import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Toaster } from '@/components/ui/sonner';
import { useData } from '@/hooks/useData';
import { SettingsSection } from '@/sections/SettingsSection';
import { DailySection } from '@/sections/DailySection';
import { WaterSection } from '@/sections/WaterSection';
import { ActivitySection } from '@/sections/ActivitySection';
import { ThesisSection } from '@/sections/ThesisSection';
import { DashboardSection } from '@/sections/DashboardSection';
import { 
  Settings, 
  Calendar, 
  Droplets, 
  Footprints, 
  BookOpen, 
  LayoutDashboard,
  Heart
} from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const {
    data,
    isLoaded,
    gistToken,
    gistId,
    isSyncing,
    lastSyncTime,
    updateSettings,
    addDailyRecord,
    deleteDailyRecord,
    addWaterRecord,
    deleteWaterRecord,
    addActivityRecord,
    deleteActivityRecord,
    addThesisRecord,
    deleteThesisRecord,
    calculateWaterTarget,
    calculateThesisDailyTarget,
    exportData,
    importData,
    clearAllData,
    saveGistConfig,
    uploadToGist,
    downloadFromGist,
  } = useData();

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Heart className="h-12 w-12 text-blue-500 animate-pulse mx-auto mb-4" />
          <p className="text-gray-500">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部 */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  健康与学术追踪
                </h1>
                <p className="text-xs text-gray-500">Health & Academic Tracker</p>
              </div>
            </div>
            <div className="text-sm text-gray-500 hidden sm:block">
              {new Date().toLocaleDateString('zh-CN', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                weekday: 'long'
              })}
            </div>
          </div>
        </div>
      </header>

      {/* 主内容 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* 导航标签 */}
          <div className="bg-white rounded-lg shadow-sm p-1 overflow-x-auto">
            <TabsList className="w-full justify-start bg-transparent h-auto p-0 gap-1">
              <TabsTrigger 
                value="dashboard" 
                className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 px-4 py-2 rounded-md flex items-center gap-2"
              >
                <LayoutDashboard className="h-4 w-4" />
                <span className="hidden sm:inline">看板</span>
              </TabsTrigger>
              <TabsTrigger 
                value="daily"
                className="data-[state=active]:bg-green-50 data-[state=active]:text-green-600 px-4 py-2 rounded-md flex items-center gap-2"
              >
                <Calendar className="h-4 w-4" />
                <span className="hidden sm:inline">每日记录</span>
              </TabsTrigger>
              <TabsTrigger 
                value="water"
                className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 px-4 py-2 rounded-md flex items-center gap-2"
              >
                <Droplets className="h-4 w-4" />
                <span className="hidden sm:inline">饮水</span>
              </TabsTrigger>
              <TabsTrigger 
                value="activity"
                className="data-[state=active]:bg-orange-50 data-[state=active]:text-orange-600 px-4 py-2 rounded-md flex items-center gap-2"
              >
                <Footprints className="h-4 w-4" />
                <span className="hidden sm:inline">活动</span>
              </TabsTrigger>
              <TabsTrigger 
                value="thesis"
                className="data-[state=active]:bg-purple-50 data-[state=active]:text-purple-600 px-4 py-2 rounded-md flex items-center gap-2"
              >
                <BookOpen className="h-4 w-4" />
                <span className="hidden sm:inline">论文</span>
              </TabsTrigger>
              <TabsTrigger 
                value="settings"
                className="data-[state=active]:bg-gray-100 data-[state=active]:text-gray-700 px-4 py-2 rounded-md flex items-center gap-2"
              >
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">设置</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* 内容区域 */}
          <TabsContent value="dashboard" className="mt-0">
            <DashboardSection 
              data={data}
              calculateWaterTarget={calculateWaterTarget}
              calculateThesisDailyTarget={calculateThesisDailyTarget}
            />
          </TabsContent>

          <TabsContent value="daily" className="mt-0">
            <DailySection 
              records={data.dailyRecords}
              settings={data.settings}
              onAdd={addDailyRecord}
              onDelete={deleteDailyRecord}
              calculateWaterTarget={calculateWaterTarget}
            />
          </TabsContent>

          <TabsContent value="water" className="mt-0">
            <WaterSection 
              records={data.waterRecords}
              onAdd={addWaterRecord}
              onDelete={deleteWaterRecord}
            />
          </TabsContent>

          <TabsContent value="activity" className="mt-0">
            <ActivitySection 
              records={data.activityRecords}
              onAdd={addActivityRecord}
              onDelete={deleteActivityRecord}
            />
          </TabsContent>

          <TabsContent value="thesis" className="mt-0">
            <ThesisSection 
              records={data.thesisRecords}
              settings={data.settings}
              onAdd={addThesisRecord}
              onDelete={deleteThesisRecord}
            />
          </TabsContent>

          <TabsContent value="settings" className="mt-0">
            <SettingsSection 
              settings={data.settings}
              onUpdate={updateSettings}
              gistToken={gistToken}
              gistId={gistId}
              isSyncing={isSyncing}
              lastSyncTime={lastSyncTime}
              onExport={exportData}
              onImport={importData}
              onClear={clearAllData}
              onSaveGistConfig={saveGistConfig}
              onUploadToGist={uploadToGist}
              onDownloadFromGist={downloadFromGist}
            />
          </TabsContent>
        </Tabs>
      </main>

      {/* 页脚 */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-sm text-gray-500">
            健康与学术进度追踪系统 · 数据保存在本地浏览器中
          </p>
        </div>
      </footer>

      <Toaster />
    </div>
  );
}

export default App;
