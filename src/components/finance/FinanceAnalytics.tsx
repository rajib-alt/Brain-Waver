import { useMemo } from 'react';
import { useFinanceStore } from '@/store/useFinanceStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  DollarSign, TrendingUp, TrendingDown, PiggyBank,
  ArrowUpRight, ArrowDownRight,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, LineChart, Line
} from 'recharts';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const PIE_COLORS = [
  'hsl(38, 85%, 55%)', 'hsl(25, 70%, 50%)', 'hsl(200, 60%, 50%)',
  'hsl(150, 50%, 45%)', 'hsl(340, 60%, 55%)', 'hsl(270, 50%, 55%)',
  'hsl(45, 80%, 50%)', 'hsl(180, 50%, 45%)', 'hsl(10, 70%, 55%)',
  'hsl(60, 60%, 45%)', 'hsl(220, 55%, 55%)', 'hsl(300, 45%, 50%)',
];

function StatCard({ icon: Icon, label, value, trend, positive }: { icon: any; label: string; value: string; trend?: string; positive?: boolean }) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">{label}</p>
            <p className="text-2xl font-heading font-bold mt-1 text-foreground">{value}</p>
            {trend && (
              <div className={`flex items-center gap-1 mt-1 text-xs ${positive ? 'text-green-500' : 'text-destructive'}`}>
                {positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                {trend}
              </div>
            )}
          </div>
          <div className="h-10 w-10 rounded-lg flex items-center justify-center bg-primary/15 text-primary">
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function FinanceAnalytics() {
  const store = useFinanceStore();
  const fmt = (n: number) => '$' + n.toLocaleString();

  const stats = useMemo(() => {
    const income = store.transactions.filter(t => t.incomeExpense === 'Income').reduce((s, t) => s + t.amount, 0);
    const expense = store.transactions.filter(t => t.incomeExpense === 'Expense').reduce((s, t) => s + t.amount, 0);
    return { income, expense, net: income - expense, savingsRate: income > 0 ? ((income - expense) / income * 100) : 0 };
  }, [store.transactions]);

  const monthlyChart = useMemo(() => {
    const map: Record<string, { month: string; income: number; expense: number }> = {};
    store.transactions.forEach(t => {
      const d = new Date(t.date);
      const key = MONTHS[d.getMonth()];
      if (!map[key]) map[key] = { month: key, income: 0, expense: 0 };
      if (t.incomeExpense === 'Income') map[key].income += t.amount;
      else map[key].expense += t.amount;
    });
    return MONTHS.map(m => map[m] || { month: m, income: 0, expense: 0 });
  }, [store.transactions]);

  const cumulativeSavings = useMemo(() => {
    let cumulative = 0;
    return monthlyChart.map(m => {
      cumulative += m.income - m.expense;
      return { month: m.month, savings: cumulative };
    });
  }, [monthlyChart]);

  const savingsRate = useMemo(() => {
    return monthlyChart.map(m => ({
      month: m.month,
      rate: m.income > 0 ? Math.round(((m.income - m.expense) / m.income) * 100) : 0,
    }));
  }, [monthlyChart]);

  const expenseByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    store.transactions.filter(t => t.incomeExpense === 'Expense').forEach(t => {
      map[t.type] = (map[t.type] || 0) + t.amount;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [store.transactions]);

  const topExpenses = expenseByCategory.slice(0, 5);
  const maxExpense = topExpenses[0]?.value || 1;

  const tooltipStyle = {
    background: 'hsl(var(--card))',
    border: '1px solid hsl(var(--border))',
    borderRadius: 8,
    fontSize: 12,
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={TrendingUp} label="Income" value={fmt(stats.income)} positive />
        <StatCard icon={TrendingDown} label="Expenses" value={fmt(stats.expense)} />
        <StatCard icon={DollarSign} label="Net" value={fmt(stats.net)} positive={stats.net >= 0} trend={stats.net >= 0 ? 'Surplus' : 'Deficit'} />
        <StatCard icon={PiggyBank} label="Savings Rate" value={`${stats.savingsRate.toFixed(1)}%`} positive={stats.savingsRate > 0} />
      </div>

      {/* Income vs Expense + Cumulative Savings */}
      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-heading">Income vs Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={monthlyChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => fmt(v)} />
                <Bar dataKey="income" fill="hsl(150, 50%, 45%)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" fill="hsl(0, 72%, 50%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-heading">Cumulative Savings</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={cumulativeSavings}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => fmt(v)} />
                <Area type="monotone" dataKey="savings" stroke="hsl(38, 85%, 55%)" fill="hsl(38, 85%, 55%)" fillOpacity={0.15} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Pie + Savings Rate + Top Expenses */}
      <div className="grid lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-heading">Expense Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={expenseByCategory} cx="50%" cy="50%" innerRadius={55} outerRadius={95} paddingAngle={2} dataKey="value">
                  {expenseByCategory.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => fmt(v)} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-heading">Monthly Savings Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={savingsRate}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} unit="%" />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => `${v}%`} />
                <Line type="monotone" dataKey="rate" stroke="hsl(200, 60%, 50%)" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-heading">Top Expenses</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            {topExpenses.map(cat => (
              <div key={cat.name}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-foreground font-medium">{cat.name}</span>
                  <span className="text-muted-foreground">{fmt(cat.value)}</span>
                </div>
                <Progress value={(cat.value / maxExpense) * 100} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
