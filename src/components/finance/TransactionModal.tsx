import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Transaction, TransactionType } from '@/store/useFinanceStore';

const INCOME_TYPES = ['Salary', 'Side Hustle', 'Interest / Dividends', 'Gifts / Other'];
const EXPENSE_TYPES = [
  'Rent / Mortgage', 'Utilities', 'Property Tax', 'Household Goods',
  'Car Payment', 'Fuel', 'Public Transport', 'Taxis & Other',
  'Sport', 'Health Insurance', 'Medical Expenses', 'Supplements',
  'Groceries', 'Eating Out', 'Entertainment', 'Travel', 'Other Expenses',
];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: Omit<Transaction, 'id'>) => void;
  editItem?: Transaction | null;
}

export function TransactionModal({ open, onOpenChange, onSave, editItem }: Props) {
  const [date, setDate] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('');
  const [incomeExpense, setIncomeExpense] = useState<TransactionType>('Expense');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (editItem) {
      setDate(editItem.date);
      setAmount(String(editItem.amount));
      setType(editItem.type);
      setIncomeExpense(editItem.incomeExpense);
      setDescription(editItem.description);
    } else {
      setDate(new Date().toISOString().split('T')[0]);
      setAmount('');
      setType('');
      setIncomeExpense('Expense');
      setDescription('');
    }
  }, [editItem, open]);

  const types = incomeExpense === 'Income' ? INCOME_TYPES : EXPENSE_TYPES;

  const handleSave = () => {
    if (!date || !amount || !type) return;
    onSave({ date, amount: parseFloat(amount), type, incomeExpense, description });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading">{editItem ? 'Edit' : 'Add'} Transaction</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Date</Label>
              <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="h-9 text-sm" />
            </div>
            <div>
              <Label className="text-xs">Amount ($)</Label>
              <Input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0" className="h-9 text-sm" />
            </div>
          </div>
          <div>
            <Label className="text-xs">Income / Expense</Label>
            <Select value={incomeExpense} onValueChange={v => { setIncomeExpense(v as TransactionType); setType(''); }}>
              <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Income">Income</SelectItem>
                <SelectItem value="Expense">Expense</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Category</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select category" /></SelectTrigger>
              <SelectContent>
                {types.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Description</Label>
            <Input value={description} onChange={e => setDescription(e.target.value)} placeholder="Optional note" className="h-9 text-sm" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button size="sm" onClick={handleSave} disabled={!date || !amount || !type}>Save</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
