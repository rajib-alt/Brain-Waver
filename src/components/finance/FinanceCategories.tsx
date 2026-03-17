import { useMemo } from 'react';
import { useFinanceStore } from '@/store/useFinanceStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown } from 'lucide-react';

const CATEGORY_GROUPS: Record<string, string[]> = {
  'Housing': ['Rent / Mortgage', 'Utilities', 'Property Tax', 'Household Goods'],
  'Transport': ['Car Payment', 'Fuel', 'Public Transport', 'Taxis & Other'],
  'Health': ['Sport', 'Health Insurance', 'Medical Expenses', 'Supplements'],
  'Food & Lifestyle': ['Groceries', 'Eating Out', 'Entertainment', 'Travel'],
  'Other': ['Other Expenses'],
  'Income Sources': ['Salary', 'Side Hustle', 'Interest / Dividends', 'Gifts / Other'],
};

export function FinanceCategories() {
  const store = useFinanceStore();

  const categoryData = useMemo(() => {
    const map: Record<string, { total: number; count: number; incomeExpense: string }> = {};
    store.transactions.forEach(t => {
      if (!map[t.type]) map[t.type] = { total: 0, count: 0, incomeExpense: t.incomeExpense };
      map[t.type].total += t.amount;
      map[t.type].count++;
    });
    return map;
  }, [store.transactions]);

  const groupData = useMemo(() => {
    return Object.entries(CATEGORY_GROUPS).map(([group, cats]) => {
      const subcats = cats.map(cat => ({
        name: cat,
        total: categoryData[cat]?.total || 0,
        count: categoryData[cat]?.count || 0,
        avg: categoryData[cat] ? Math.round(categoryData[cat].total / categoryData[cat].count) : 0,
      }));
      const groupTotal = subcats.reduce((s, c) => s + c.total, 0);
      const isIncome = group === 'Income Sources';
      return { group, subcats, total: groupTotal, isIncome };
    });
  }, [categoryData]);

  const totalExpenses = groupData.filter(g => !g.isIncome).reduce((s, g) => s + g.total, 0);
  const totalIncome = groupData.find(g => g.isIncome)?.total || 0;

  const fmt = (n: number) => '$' + n.toLocaleString();

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-green-500/15 text-green-500 flex items-center justify-center">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Total Income</p>
                <p className="text-2xl font-heading font-bold text-foreground">{fmt(totalIncome)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-destructive/15 text-destructive flex items-center justify-center">
                <TrendingDown className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Total Expenses</p>
                <p className="text-2xl font-heading font-bold text-foreground">{fmt(totalExpenses)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category groups */}
      {groupData.map(({ group, subcats, total, isIncome }) => (
        <Card key={group}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-heading flex items-center gap-2">
                {group}
                <Badge variant={isIncome ? 'default' : 'secondary'} className="text-[10px]">
                  {fmt(total)}
                </Badge>
              </CardTitle>
              {!isIncome && totalExpenses > 0 && (
                <span className="text-xs text-muted-foreground">
                  {((total / totalExpenses) * 100).toFixed(1)}% of expenses
                </span>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Subcategory</TableHead>
                  <TableHead className="text-xs text-right">Total</TableHead>
                  <TableHead className="text-xs text-right">Avg/month</TableHead>
                  <TableHead className="text-xs text-right">Txns</TableHead>
                  <TableHead className="text-xs w-[200px]">Share</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subcats.filter(s => s.total > 0).map(sub => (
                  <TableRow key={sub.name}>
                    <TableCell className="text-xs py-2 font-medium">{sub.name}</TableCell>
                    <TableCell className="text-xs py-2 text-right">{fmt(sub.total)}</TableCell>
                    <TableCell className="text-xs py-2 text-right text-muted-foreground">{fmt(sub.avg)}</TableCell>
                    <TableCell className="text-xs py-2 text-right text-muted-foreground">{sub.count}</TableCell>
                    <TableCell className="py-2">
                      <Progress value={total > 0 ? (sub.total / total) * 100 : 0} className="h-1.5" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
