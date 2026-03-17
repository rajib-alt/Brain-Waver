import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TableProperties, FolderTree, BarChart3 } from 'lucide-react';
import { FinanceEntry } from './FinanceEntry';
import { FinanceCategories } from './FinanceCategories';
import { FinanceAnalytics } from './FinanceAnalytics';

export function FinanceDashboard() {
  const [tab, setTab] = useState('entry');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-heading font-semibold text-foreground">Personal Finances</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Track your income, expenses, and savings.</p>
        </div>
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="h-9">
            <TabsTrigger value="entry" className="text-xs h-7 gap-1.5 px-3">
              <TableProperties className="h-3.5 w-3.5" /> Entry
            </TabsTrigger>
            <TabsTrigger value="categories" className="text-xs h-7 gap-1.5 px-3">
              <FolderTree className="h-3.5 w-3.5" /> Categories
            </TabsTrigger>
            <TabsTrigger value="analytics" className="text-xs h-7 gap-1.5 px-3">
              <BarChart3 className="h-3.5 w-3.5" /> Analytics
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {tab === 'entry' && <FinanceEntry />}
      {tab === 'categories' && <FinanceCategories />}
      {tab === 'analytics' && <FinanceAnalytics />}
    </div>
  );
}
