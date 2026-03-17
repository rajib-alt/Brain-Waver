import { useState, useMemo } from 'react';
import { useFinanceStore, type Transaction, type TransactionType } from '@/store/useFinanceStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Pencil, Trash2, Check, X, Search, GripVertical } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const INCOME_TYPES = ['Salary', 'Side Hustle', 'Interest / Dividends', 'Gifts / Other'];
const EXPENSE_TYPES = [
  'Rent / Mortgage', 'Utilities', 'Property Tax', 'Household Goods',
  'Car Payment', 'Fuel', 'Public Transport', 'Taxis & Other',
  'Sport', 'Health Insurance', 'Medical Expenses', 'Supplements',
  'Groceries', 'Eating Out', 'Entertainment', 'Travel', 'Other Expenses',
];

const MONTHS = ['All', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

interface EditingRow {
  date: string;
  amount: string;
  type: string;
  incomeExpense: TransactionType;
  description: string;
}

const fmt = (n: number) => '$' + n.toLocaleString();
const getTypes = (ie: TransactionType) => ie === 'Income' ? INCOME_TYPES : EXPENSE_TYPES;

interface SortableRowProps {
  t: Transaction;
  editingId: string | null;
  editingRow: EditingRow | null;
  setEditingRow: (r: EditingRow | null) => void;
  startEdit: (t: Transaction) => void;
  saveEdit: () => void;
  cancelEdit: () => void;
  onDelete: (id: string) => void;
}

function SortableRow({ t, editingId, editingRow, setEditingRow, startEdit, saveEdit, cancelEdit, onDelete }: SortableRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: t.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const isEditing = editingId === t.id && editingRow;

  return (
    <TableRow ref={setNodeRef} style={style}>
      <TableCell className="py-1.5 w-[40px] px-1">
        <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1 text-muted-foreground hover:text-foreground touch-none">
          <GripVertical className="h-3.5 w-3.5" />
        </button>
      </TableCell>
      {isEditing ? (
        <>
          <TableCell className="py-1.5">
            <Input type="date" value={editingRow.date} onChange={e => setEditingRow({ ...editingRow, date: e.target.value })} className="h-7 text-xs" />
          </TableCell>
          <TableCell className="py-1.5">
            <Select value={editingRow.incomeExpense} onValueChange={v => setEditingRow({ ...editingRow, incomeExpense: v as TransactionType, type: '' })}>
              <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Income">Income</SelectItem>
                <SelectItem value="Expense">Expense</SelectItem>
              </SelectContent>
            </Select>
          </TableCell>
          <TableCell className="py-1.5">
            <Select value={editingRow.type} onValueChange={v => setEditingRow({ ...editingRow, type: v })}>
              <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {getTypes(editingRow.incomeExpense).map(tp => <SelectItem key={tp} value={tp}>{tp}</SelectItem>)}
              </SelectContent>
            </Select>
          </TableCell>
          <TableCell className="py-1.5">
            <Input type="number" value={editingRow.amount} onChange={e => setEditingRow({ ...editingRow, amount: e.target.value })} className="h-7 text-xs text-right" />
          </TableCell>
          <TableCell className="py-1.5">
            <Input value={editingRow.description} onChange={e => setEditingRow({ ...editingRow, description: e.target.value })} className="h-7 text-xs" />
          </TableCell>
          <TableCell className="py-1.5">
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" className="h-6 w-6 text-green-500" onClick={saveEdit}><Check className="h-3 w-3" /></Button>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={cancelEdit}><X className="h-3 w-3" /></Button>
            </div>
          </TableCell>
        </>
      ) : (
        <>
          <TableCell className="text-xs py-2">{t.date}</TableCell>
          <TableCell className="py-2">
            <span className={`text-xs px-2 py-0.5 rounded-full ${t.incomeExpense === 'Income' ? 'bg-green-500/15 text-green-500' : 'bg-destructive/15 text-destructive'}`}>
              {t.incomeExpense}
            </span>
          </TableCell>
          <TableCell className="text-xs py-2">{t.type}</TableCell>
          <TableCell className={`text-xs py-2 text-right font-medium ${t.incomeExpense === 'Income' ? 'text-green-500' : 'text-destructive'}`}>
            {t.incomeExpense === 'Income' ? '+' : '-'}{fmt(t.amount)}
          </TableCell>
          <TableCell className="text-xs py-2 text-muted-foreground">{t.description}</TableCell>
          <TableCell className="py-2">
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => startEdit(t)}><Pencil className="h-3 w-3" /></Button>
              <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => onDelete(t.id)}><Trash2 className="h-3 w-3" /></Button>
            </div>
          </TableCell>
        </>
      )}
    </TableRow>
  );
}

export function FinanceEntry() {
  const store = useFinanceStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingRow, setEditingRow] = useState<EditingRow | null>(null);
  const [newRow, setNewRow] = useState<EditingRow | null>(null);
  const [search, setSearch] = useState('');
  const [monthFilter, setMonthFilter] = useState('All');

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  );

  const filtered = useMemo(() => {
    let list = store.transactions;
    if (monthFilter !== 'All') {
      const idx = MONTHS.indexOf(monthFilter);
      list = list.filter(t => new Date(t.date).getMonth() + 1 === idx);
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(t =>
        t.type.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.date.includes(q)
      );
    }
    return list;
  }, [store.transactions, monthFilter, search]);

  const isFiltered = monthFilter !== 'All' || search !== '';

  const startEdit = (t: Transaction) => {
    setEditingId(t.id);
    setEditingRow({ date: t.date, amount: String(t.amount), type: t.type, incomeExpense: t.incomeExpense, description: t.description });
  };

  const saveEdit = () => {
    if (!editingId || !editingRow || !editingRow.date || !editingRow.amount || !editingRow.type) return;
    store.updateTransaction(editingId, {
      date: editingRow.date,
      amount: parseFloat(editingRow.amount),
      type: editingRow.type,
      incomeExpense: editingRow.incomeExpense,
      description: editingRow.description,
    });
    setEditingId(null);
    setEditingRow(null);
  };

  const cancelEdit = () => { setEditingId(null); setEditingRow(null); };

  const startNew = () => {
    setNewRow({ date: new Date().toISOString().split('T')[0], amount: '', type: '', incomeExpense: 'Expense', description: '' });
  };

  const saveNew = () => {
    if (!newRow || !newRow.date || !newRow.amount || !newRow.type) return;
    store.addTransaction({
      date: newRow.date,
      amount: parseFloat(newRow.amount),
      type: newRow.type,
      incomeExpense: newRow.incomeExpense,
      description: newRow.description,
    });
    setNewRow(null);
  };

  const cancelNew = () => setNewRow(null);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = filtered.findIndex(t => t.id === active.id);
    const newIndex = filtered.findIndex(t => t.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    // Reorder in the full transaction list
    const allIds = store.transactions.map(t => t.id);
    const filteredReordered = arrayMove(filtered, oldIndex, newIndex);

    // Build new full order: replace filtered items in their positions
    const filteredIdSet = new Set(filtered.map(t => t.id));
    const newOrder: string[] = [];
    let fi = 0;
    for (const id of allIds) {
      if (filteredIdSet.has(id)) {
        newOrder.push(filteredReordered[fi].id);
        fi++;
      } else {
        newOrder.push(id);
      }
    }
    store.reorderTransactions(newOrder);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search transactions..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="h-8 pl-8 text-xs"
            />
          </div>
          <Select value={monthFilter} onValueChange={setMonthFilter}>
            <SelectTrigger className="h-8 w-24 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {MONTHS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <Button size="sm" className="h-8 gap-1.5 text-xs" onClick={startNew} disabled={!!newRow}>
          <Plus className="h-3.5 w-3.5" /> Add Row
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-heading">Transactions ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-[600px] overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs w-[40px] px-1"></TableHead>
                  <TableHead className="text-xs w-[120px]">Date</TableHead>
                  <TableHead className="text-xs w-[100px]">Type</TableHead>
                  <TableHead className="text-xs w-[160px]">Category</TableHead>
                  <TableHead className="text-xs text-right w-[100px]">Amount</TableHead>
                  <TableHead className="text-xs">Description</TableHead>
                  <TableHead className="text-xs w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {newRow && (
                  <TableRow className="bg-primary/5">
                    <TableCell className="py-1.5 w-[40px] px-1" />
                    <TableCell className="py-1.5">
                      <Input type="date" value={newRow.date} onChange={e => setNewRow({ ...newRow, date: e.target.value })} className="h-7 text-xs" />
                    </TableCell>
                    <TableCell className="py-1.5">
                      <Select value={newRow.incomeExpense} onValueChange={v => setNewRow({ ...newRow, incomeExpense: v as TransactionType, type: '' })}>
                        <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Income">Income</SelectItem>
                          <SelectItem value="Expense">Expense</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="py-1.5">
                      <Select value={newRow.type} onValueChange={v => setNewRow({ ...newRow, type: v })}>
                        <SelectTrigger className="h-7 text-xs"><SelectValue placeholder="Category" /></SelectTrigger>
                        <SelectContent>
                          {getTypes(newRow.incomeExpense).map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="py-1.5">
                      <Input type="number" value={newRow.amount} onChange={e => setNewRow({ ...newRow, amount: e.target.value })} placeholder="0" className="h-7 text-xs text-right" />
                    </TableCell>
                    <TableCell className="py-1.5">
                      <Input value={newRow.description} onChange={e => setNewRow({ ...newRow, description: e.target.value })} placeholder="Note" className="h-7 text-xs" />
                    </TableCell>
                    <TableCell className="py-1.5">
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-green-500" onClick={saveNew}><Check className="h-3 w-3" /></Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={cancelNew}><X className="h-3 w-3" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={filtered.map(t => t.id)} strategy={verticalListSortingStrategy} disabled={isFiltered}>
                    {filtered.map(t => (
                      <SortableRow
                        key={t.id}
                        t={t}
                        editingId={editingId}
                        editingRow={editingRow}
                        setEditingRow={setEditingRow}
                        startEdit={startEdit}
                        saveEdit={saveEdit}
                        cancelEdit={cancelEdit}
                        onDelete={store.deleteTransaction}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
