import { useState, useCallback } from 'react';

export type TransactionType = 'Income' | 'Expense';

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  type: string;
  incomeExpense: TransactionType;
  description: string;
}

const STORAGE_KEY = 'finance-transactions';

const INITIAL_DATA: Omit<Transaction, 'id'>[] = [
  // January
  { date: '2026-01-01', amount: 3282, type: 'Salary', incomeExpense: 'Income', description: 'Monthly salary' },
  { date: '2026-01-02', amount: 608, type: 'Side Hustle', incomeExpense: 'Income', description: 'Side project income' },
  { date: '2026-01-03', amount: 130, type: 'Interest / Dividends', incomeExpense: 'Income', description: 'Investment income' },
  { date: '2026-01-04', amount: 24, type: 'Gifts / Other', incomeExpense: 'Income', description: 'Gifts or irregular income' },
  { date: '2026-01-05', amount: 1100, type: 'Rent / Mortgage', incomeExpense: 'Expense', description: 'Monthly rent or mortgage' },
  { date: '2026-01-06', amount: 129, type: 'Utilities', incomeExpense: 'Expense', description: 'Electricity, water, internet' },
  { date: '2026-01-07', amount: 840, type: 'Property Tax', incomeExpense: 'Expense', description: 'Property tax payment' },
  { date: '2026-01-08', amount: 217, type: 'Household Goods', incomeExpense: 'Expense', description: 'Home supplies' },
  { date: '2026-01-09', amount: 420, type: 'Car Payment', incomeExpense: 'Expense', description: 'Car loan payment' },
  { date: '2026-01-10', amount: 102, type: 'Fuel', incomeExpense: 'Expense', description: 'Fuel costs' },
  { date: '2026-01-11', amount: 83, type: 'Public Transport', incomeExpense: 'Expense', description: 'Public transport' },
  { date: '2026-01-12', amount: 94, type: 'Taxis & Other', incomeExpense: 'Expense', description: 'Ride sharing & taxis' },
  { date: '2026-01-13', amount: 47, type: 'Sport', incomeExpense: 'Expense', description: 'Sports activities' },
  { date: '2026-01-14', amount: 132, type: 'Health Insurance', incomeExpense: 'Expense', description: 'Health insurance' },
  { date: '2026-01-15', amount: 109, type: 'Medical Expenses', incomeExpense: 'Expense', description: 'Doctor or pharmacy' },
  { date: '2026-01-16', amount: 24, type: 'Supplements', incomeExpense: 'Expense', description: 'Vitamins & supplements' },
  { date: '2026-01-17', amount: 382, type: 'Groceries', incomeExpense: 'Expense', description: 'Food shopping' },
  { date: '2026-01-18', amount: 261, type: 'Eating Out', incomeExpense: 'Expense', description: 'Restaurants & cafés' },
  { date: '2026-01-19', amount: 227, type: 'Entertainment', incomeExpense: 'Expense', description: 'Movies & events' },
  { date: '2026-01-20', amount: 143, type: 'Travel', incomeExpense: 'Expense', description: 'Trips & holidays' },
  { date: '2026-01-21', amount: 121, type: 'Other Expenses', incomeExpense: 'Expense', description: 'Miscellaneous' },
  // February
  { date: '2026-02-01', amount: 3223, type: 'Salary', incomeExpense: 'Income', description: 'Monthly salary' },
  { date: '2026-02-02', amount: 1169, type: 'Side Hustle', incomeExpense: 'Income', description: 'Side project income' },
  { date: '2026-02-03', amount: 87, type: 'Interest / Dividends', incomeExpense: 'Income', description: 'Investment income' },
  { date: '2026-02-04', amount: 289, type: 'Gifts / Other', incomeExpense: 'Income', description: 'Gifts or irregular income' },
  { date: '2026-02-05', amount: 1100, type: 'Rent / Mortgage', incomeExpense: 'Expense', description: 'Monthly rent or mortgage' },
  { date: '2026-02-06', amount: 135, type: 'Utilities', incomeExpense: 'Expense', description: 'Electricity, water, internet' },
  { date: '2026-02-07', amount: 228, type: 'Property Tax', incomeExpense: 'Expense', description: 'Property tax payment' },
  { date: '2026-02-08', amount: 240, type: 'Household Goods', incomeExpense: 'Expense', description: 'Home supplies' },
  { date: '2026-02-09', amount: 420, type: 'Car Payment', incomeExpense: 'Expense', description: 'Car loan payment' },
  { date: '2026-02-10', amount: 164, type: 'Fuel', incomeExpense: 'Expense', description: 'Fuel costs' },
  { date: '2026-02-11', amount: 63, type: 'Public Transport', incomeExpense: 'Expense', description: 'Public transport' },
  { date: '2026-02-12', amount: 93, type: 'Taxis & Other', incomeExpense: 'Expense', description: 'Ride sharing & taxis' },
  { date: '2026-02-13', amount: 114, type: 'Sport', incomeExpense: 'Expense', description: 'Sports activities' },
  { date: '2026-02-14', amount: 125, type: 'Health Insurance', incomeExpense: 'Expense', description: 'Health insurance' },
  { date: '2026-02-15', amount: 25, type: 'Medical Expenses', incomeExpense: 'Expense', description: 'Doctor or pharmacy' },
  { date: '2026-02-16', amount: 48, type: 'Supplements', incomeExpense: 'Expense', description: 'Vitamins & supplements' },
  { date: '2026-02-17', amount: 371, type: 'Groceries', incomeExpense: 'Expense', description: 'Food shopping' },
  { date: '2026-02-18', amount: 292, type: 'Eating Out', incomeExpense: 'Expense', description: 'Restaurants & cafés' },
  { date: '2026-02-19', amount: 154, type: 'Entertainment', incomeExpense: 'Expense', description: 'Movies & events' },
  { date: '2026-02-20', amount: 240, type: 'Travel', incomeExpense: 'Expense', description: 'Trips & holidays' },
  { date: '2026-02-21', amount: 167, type: 'Other Expenses', incomeExpense: 'Expense', description: 'Miscellaneous' },
  // March
  { date: '2026-03-01', amount: 3236, type: 'Salary', incomeExpense: 'Income', description: 'Monthly salary' },
  { date: '2026-03-02', amount: 541, type: 'Side Hustle', incomeExpense: 'Income', description: 'Side project income' },
  { date: '2026-03-03', amount: 153, type: 'Interest / Dividends', incomeExpense: 'Income', description: 'Investment income' },
  { date: '2026-03-04', amount: 157, type: 'Gifts / Other', incomeExpense: 'Income', description: 'Gifts or irregular income' },
  { date: '2026-03-05', amount: 1100, type: 'Rent / Mortgage', incomeExpense: 'Expense', description: 'Monthly rent or mortgage' },
  { date: '2026-03-06', amount: 191, type: 'Utilities', incomeExpense: 'Expense', description: 'Electricity, water, internet' },
  { date: '2026-03-07', amount: 835, type: 'Property Tax', incomeExpense: 'Expense', description: 'Property tax payment' },
  { date: '2026-03-08', amount: 126, type: 'Household Goods', incomeExpense: 'Expense', description: 'Home supplies' },
  { date: '2026-03-09', amount: 420, type: 'Car Payment', incomeExpense: 'Expense', description: 'Car loan payment' },
  { date: '2026-03-10', amount: 103, type: 'Fuel', incomeExpense: 'Expense', description: 'Fuel costs' },
  { date: '2026-03-11', amount: 97, type: 'Public Transport', incomeExpense: 'Expense', description: 'Public transport' },
  { date: '2026-03-12', amount: 93, type: 'Taxis & Other', incomeExpense: 'Expense', description: 'Ride sharing & taxis' },
  { date: '2026-03-13', amount: 121, type: 'Sport', incomeExpense: 'Expense', description: 'Sports activities' },
  { date: '2026-03-14', amount: 112, type: 'Health Insurance', incomeExpense: 'Expense', description: 'Health insurance' },
  { date: '2026-03-15', amount: 190, type: 'Medical Expenses', incomeExpense: 'Expense', description: 'Doctor or pharmacy' },
  { date: '2026-03-16', amount: 32, type: 'Supplements', incomeExpense: 'Expense', description: 'Vitamins & supplements' },
  { date: '2026-03-17', amount: 500, type: 'Groceries', incomeExpense: 'Expense', description: 'Food shopping' },
  { date: '2026-03-18', amount: 332, type: 'Eating Out', incomeExpense: 'Expense', description: 'Restaurants & cafés' },
  { date: '2026-03-19', amount: 136, type: 'Entertainment', incomeExpense: 'Expense', description: 'Movies & events' },
  { date: '2026-03-20', amount: 459, type: 'Travel', incomeExpense: 'Expense', description: 'Trips & holidays' },
  { date: '2026-03-21', amount: 75, type: 'Other Expenses', incomeExpense: 'Expense', description: 'Miscellaneous' },
  // April
  { date: '2026-04-01', amount: 3358, type: 'Salary', incomeExpense: 'Income', description: 'Monthly salary' },
  { date: '2026-04-02', amount: 721, type: 'Side Hustle', incomeExpense: 'Income', description: 'Side project income' },
  { date: '2026-04-03', amount: 143, type: 'Interest / Dividends', incomeExpense: 'Income', description: 'Investment income' },
  { date: '2026-04-04', amount: 272, type: 'Gifts / Other', incomeExpense: 'Income', description: 'Gifts or irregular income' },
  { date: '2026-04-05', amount: 1100, type: 'Rent / Mortgage', incomeExpense: 'Expense', description: 'Monthly rent or mortgage' },
  { date: '2026-04-06', amount: 174, type: 'Utilities', incomeExpense: 'Expense', description: 'Electricity, water, internet' },
  { date: '2026-04-07', amount: 795, type: 'Property Tax', incomeExpense: 'Expense', description: 'Property tax payment' },
  { date: '2026-04-08', amount: 160, type: 'Household Goods', incomeExpense: 'Expense', description: 'Home supplies' },
  { date: '2026-04-09', amount: 420, type: 'Car Payment', incomeExpense: 'Expense', description: 'Car loan payment' },
  { date: '2026-04-10', amount: 149, type: 'Fuel', incomeExpense: 'Expense', description: 'Fuel costs' },
  { date: '2026-04-11', amount: 97, type: 'Public Transport', incomeExpense: 'Expense', description: 'Public transport' },
  { date: '2026-04-12', amount: 78, type: 'Taxis & Other', incomeExpense: 'Expense', description: 'Ride sharing & taxis' },
  { date: '2026-04-13', amount: 86, type: 'Sport', incomeExpense: 'Expense', description: 'Sports activities' },
  { date: '2026-04-14', amount: 119, type: 'Health Insurance', incomeExpense: 'Expense', description: 'Health insurance' },
  { date: '2026-04-15', amount: 127, type: 'Medical Expenses', incomeExpense: 'Expense', description: 'Doctor or pharmacy' },
  { date: '2026-04-16', amount: 43, type: 'Supplements', incomeExpense: 'Expense', description: 'Vitamins & supplements' },
  { date: '2026-04-17', amount: 538, type: 'Groceries', incomeExpense: 'Expense', description: 'Food shopping' },
  { date: '2026-04-18', amount: 212, type: 'Eating Out', incomeExpense: 'Expense', description: 'Restaurants & cafés' },
  { date: '2026-04-19', amount: 140, type: 'Entertainment', incomeExpense: 'Expense', description: 'Movies & events' },
  { date: '2026-04-20', amount: 648, type: 'Travel', incomeExpense: 'Expense', description: 'Trips & holidays' },
  { date: '2026-04-21', amount: 136, type: 'Other Expenses', incomeExpense: 'Expense', description: 'Miscellaneous' },
  // May
  { date: '2026-05-01', amount: 3334, type: 'Salary', incomeExpense: 'Income', description: 'Monthly salary' },
  { date: '2026-05-02', amount: 1313, type: 'Side Hustle', incomeExpense: 'Income', description: 'Side project income' },
  { date: '2026-05-03', amount: 192, type: 'Interest / Dividends', incomeExpense: 'Income', description: 'Investment income' },
  { date: '2026-05-04', amount: 175, type: 'Gifts / Other', incomeExpense: 'Income', description: 'Gifts or irregular income' },
  { date: '2026-05-05', amount: 1100, type: 'Rent / Mortgage', incomeExpense: 'Expense', description: 'Monthly rent or mortgage' },
  { date: '2026-05-06', amount: 177, type: 'Utilities', incomeExpense: 'Expense', description: 'Electricity, water, internet' },
  { date: '2026-05-07', amount: 294, type: 'Property Tax', incomeExpense: 'Expense', description: 'Property tax payment' },
  { date: '2026-05-08', amount: 235, type: 'Household Goods', incomeExpense: 'Expense', description: 'Home supplies' },
  { date: '2026-05-09', amount: 420, type: 'Car Payment', incomeExpense: 'Expense', description: 'Car loan payment' },
  { date: '2026-05-10', amount: 99, type: 'Fuel', incomeExpense: 'Expense', description: 'Fuel costs' },
  { date: '2026-05-11', amount: 67, type: 'Public Transport', incomeExpense: 'Expense', description: 'Public transport' },
  { date: '2026-05-12', amount: 85, type: 'Taxis & Other', incomeExpense: 'Expense', description: 'Ride sharing & taxis' },
  { date: '2026-05-13', amount: 93, type: 'Sport', incomeExpense: 'Expense', description: 'Sports activities' },
  { date: '2026-05-14', amount: 110, type: 'Health Insurance', incomeExpense: 'Expense', description: 'Health insurance' },
  { date: '2026-05-15', amount: 175, type: 'Medical Expenses', incomeExpense: 'Expense', description: 'Doctor or pharmacy' },
  { date: '2026-05-16', amount: 39, type: 'Supplements', incomeExpense: 'Expense', description: 'Vitamins & supplements' },
  { date: '2026-05-17', amount: 485, type: 'Groceries', incomeExpense: 'Expense', description: 'Food shopping' },
  { date: '2026-05-18', amount: 257, type: 'Eating Out', incomeExpense: 'Expense', description: 'Restaurants & cafés' },
  { date: '2026-05-19', amount: 130, type: 'Entertainment', incomeExpense: 'Expense', description: 'Movies & events' },
  { date: '2026-05-20', amount: 0, type: 'Travel', incomeExpense: 'Expense', description: 'Trips & holidays' },
  { date: '2026-05-21', amount: 79, type: 'Other Expenses', incomeExpense: 'Expense', description: 'Miscellaneous' },
  // June
  { date: '2026-06-01', amount: 3845, type: 'Salary', incomeExpense: 'Income', description: 'Monthly salary' },
  { date: '2026-06-02', amount: 942, type: 'Side Hustle', incomeExpense: 'Income', description: 'Side project income' },
  { date: '2026-06-03', amount: 123, type: 'Interest / Dividends', incomeExpense: 'Income', description: 'Investment income' },
  { date: '2026-06-04', amount: 179, type: 'Gifts / Other', incomeExpense: 'Income', description: 'Gifts or irregular income' },
  { date: '2026-06-05', amount: 1100, type: 'Rent / Mortgage', incomeExpense: 'Expense', description: 'Monthly rent or mortgage' },
  { date: '2026-06-06', amount: 196, type: 'Utilities', incomeExpense: 'Expense', description: 'Electricity, water, internet' },
  { date: '2026-06-07', amount: 508, type: 'Property Tax', incomeExpense: 'Expense', description: 'Property tax payment' },
  { date: '2026-06-08', amount: 228, type: 'Household Goods', incomeExpense: 'Expense', description: 'Home supplies' },
  { date: '2026-06-09', amount: 420, type: 'Car Payment', incomeExpense: 'Expense', description: 'Car loan payment' },
  { date: '2026-06-10', amount: 148, type: 'Fuel', incomeExpense: 'Expense', description: 'Fuel costs' },
  { date: '2026-06-11', amount: 64, type: 'Public Transport', incomeExpense: 'Expense', description: 'Public transport' },
  { date: '2026-06-12', amount: 31, type: 'Taxis & Other', incomeExpense: 'Expense', description: 'Ride sharing & taxis' },
  { date: '2026-06-13', amount: 74, type: 'Sport', incomeExpense: 'Expense', description: 'Sports activities' },
  { date: '2026-06-14', amount: 130, type: 'Health Insurance', incomeExpense: 'Expense', description: 'Health insurance' },
  { date: '2026-06-15', amount: 33, type: 'Medical Expenses', incomeExpense: 'Expense', description: 'Doctor or pharmacy' },
  { date: '2026-06-16', amount: 27, type: 'Supplements', incomeExpense: 'Expense', description: 'Vitamins & supplements' },
  { date: '2026-06-17', amount: 539, type: 'Groceries', incomeExpense: 'Expense', description: 'Food shopping' },
  { date: '2026-06-18', amount: 229, type: 'Eating Out', incomeExpense: 'Expense', description: 'Restaurants & cafés' },
  { date: '2026-06-19', amount: 285, type: 'Entertainment', incomeExpense: 'Expense', description: 'Movies & events' },
  { date: '2026-06-20', amount: 0, type: 'Travel', incomeExpense: 'Expense', description: 'Trips & holidays' },
  { date: '2026-06-21', amount: 234, type: 'Other Expenses', incomeExpense: 'Expense', description: 'Miscellaneous' },
  // July
  { date: '2026-07-01', amount: 3848, type: 'Salary', incomeExpense: 'Income', description: 'Monthly salary' },
  { date: '2026-07-02', amount: 882, type: 'Side Hustle', incomeExpense: 'Income', description: 'Side project income' },
  { date: '2026-07-03', amount: 171, type: 'Interest / Dividends', incomeExpense: 'Income', description: 'Investment income' },
  { date: '2026-07-04', amount: 197, type: 'Gifts / Other', incomeExpense: 'Income', description: 'Gifts or irregular income' },
  { date: '2026-07-05', amount: 1100, type: 'Rent / Mortgage', incomeExpense: 'Expense', description: 'Monthly rent or mortgage' },
  { date: '2026-07-06', amount: 164, type: 'Utilities', incomeExpense: 'Expense', description: 'Electricity, water, internet' },
  { date: '2026-07-07', amount: 23, type: 'Property Tax', incomeExpense: 'Expense', description: 'Property tax payment' },
  { date: '2026-07-08', amount: 198, type: 'Household Goods', incomeExpense: 'Expense', description: 'Home supplies' },
  { date: '2026-07-09', amount: 420, type: 'Car Payment', incomeExpense: 'Expense', description: 'Car loan payment' },
  { date: '2026-07-10', amount: 135, type: 'Fuel', incomeExpense: 'Expense', description: 'Fuel costs' },
  { date: '2026-07-11', amount: 70, type: 'Public Transport', incomeExpense: 'Expense', description: 'Public transport' },
  { date: '2026-07-12', amount: 98, type: 'Taxis & Other', incomeExpense: 'Expense', description: 'Ride sharing & taxis' },
  { date: '2026-07-13', amount: 54, type: 'Sport', incomeExpense: 'Expense', description: 'Sports activities' },
  { date: '2026-07-14', amount: 131, type: 'Health Insurance', incomeExpense: 'Expense', description: 'Health insurance' },
  { date: '2026-07-15', amount: 30, type: 'Medical Expenses', incomeExpense: 'Expense', description: 'Doctor or pharmacy' },
  { date: '2026-07-16', amount: 47, type: 'Supplements', incomeExpense: 'Expense', description: 'Vitamins & supplements' },
  { date: '2026-07-17', amount: 433, type: 'Groceries', incomeExpense: 'Expense', description: 'Food shopping' },
  { date: '2026-07-18', amount: 183, type: 'Eating Out', incomeExpense: 'Expense', description: 'Restaurants & cafés' },
  { date: '2026-07-19', amount: 309, type: 'Entertainment', incomeExpense: 'Expense', description: 'Movies & events' },
  { date: '2026-07-20', amount: 507, type: 'Travel', incomeExpense: 'Expense', description: 'Trips & holidays' },
  { date: '2026-07-21', amount: 161, type: 'Other Expenses', incomeExpense: 'Expense', description: 'Miscellaneous' },
  // August
  { date: '2026-08-01', amount: 3848, type: 'Salary', incomeExpense: 'Income', description: 'Monthly salary' },
  { date: '2026-08-02', amount: 1316, type: 'Side Hustle', incomeExpense: 'Income', description: 'Side project income' },
  { date: '2026-08-03', amount: 90, type: 'Interest / Dividends', incomeExpense: 'Income', description: 'Investment income' },
  { date: '2026-08-04', amount: 85, type: 'Gifts / Other', incomeExpense: 'Income', description: 'Gifts or irregular income' },
  { date: '2026-08-05', amount: 1100, type: 'Rent / Mortgage', incomeExpense: 'Expense', description: 'Monthly rent or mortgage' },
  { date: '2026-08-06', amount: 177, type: 'Utilities', incomeExpense: 'Expense', description: 'Electricity, water, internet' },
  { date: '2026-08-07', amount: 411, type: 'Property Tax', incomeExpense: 'Expense', description: 'Property tax payment' },
  { date: '2026-08-08', amount: 220, type: 'Household Goods', incomeExpense: 'Expense', description: 'Home supplies' },
  { date: '2026-08-09', amount: 420, type: 'Car Payment', incomeExpense: 'Expense', description: 'Car loan payment' },
  { date: '2026-08-10', amount: 125, type: 'Fuel', incomeExpense: 'Expense', description: 'Fuel costs' },
  { date: '2026-08-11', amount: 68, type: 'Public Transport', incomeExpense: 'Expense', description: 'Public transport' },
  { date: '2026-08-12', amount: 75, type: 'Taxis & Other', incomeExpense: 'Expense', description: 'Ride sharing & taxis' },
  { date: '2026-08-13', amount: 150, type: 'Sport', incomeExpense: 'Expense', description: 'Sports activities' },
  { date: '2026-08-14', amount: 135, type: 'Health Insurance', incomeExpense: 'Expense', description: 'Health insurance' },
  { date: '2026-08-15', amount: 142, type: 'Medical Expenses', incomeExpense: 'Expense', description: 'Doctor or pharmacy' },
  { date: '2026-08-16', amount: 110, type: 'Supplements', incomeExpense: 'Expense', description: 'Vitamins & supplements' },
  { date: '2026-08-17', amount: 466, type: 'Groceries', incomeExpense: 'Expense', description: 'Food shopping' },
  { date: '2026-08-18', amount: 241, type: 'Eating Out', incomeExpense: 'Expense', description: 'Restaurants & cafés' },
  { date: '2026-08-19', amount: 294, type: 'Entertainment', incomeExpense: 'Expense', description: 'Movies & events' },
  { date: '2026-08-20', amount: 779, type: 'Travel', incomeExpense: 'Expense', description: 'Trips & holidays' },
  { date: '2026-08-21', amount: 119, type: 'Other Expenses', incomeExpense: 'Expense', description: 'Miscellaneous' },
  // September
  { date: '2026-09-01', amount: 3848, type: 'Salary', incomeExpense: 'Income', description: 'Monthly salary' },
  { date: '2026-09-02', amount: 469, type: 'Side Hustle', incomeExpense: 'Income', description: 'Side project income' },
  { date: '2026-09-03', amount: 102, type: 'Interest / Dividends', incomeExpense: 'Income', description: 'Investment income' },
  { date: '2026-09-04', amount: 77, type: 'Gifts / Other', incomeExpense: 'Income', description: 'Gifts or irregular income' },
  { date: '2026-09-05', amount: 1100, type: 'Rent / Mortgage', incomeExpense: 'Expense', description: 'Monthly rent or mortgage' },
  { date: '2026-09-06', amount: 149, type: 'Utilities', incomeExpense: 'Expense', description: 'Electricity, water, internet' },
  { date: '2026-09-07', amount: 674, type: 'Property Tax', incomeExpense: 'Expense', description: 'Property tax payment' },
  { date: '2026-09-08', amount: 139, type: 'Household Goods', incomeExpense: 'Expense', description: 'Home supplies' },
  { date: '2026-09-09', amount: 420, type: 'Car Payment', incomeExpense: 'Expense', description: 'Car loan payment' },
  { date: '2026-09-10', amount: 91, type: 'Fuel', incomeExpense: 'Expense', description: 'Fuel costs' },
  { date: '2026-09-11', amount: 91, type: 'Public Transport', incomeExpense: 'Expense', description: 'Public transport' },
  { date: '2026-09-12', amount: 95, type: 'Taxis & Other', incomeExpense: 'Expense', description: 'Ride sharing & taxis' },
  { date: '2026-09-13', amount: 63, type: 'Sport', incomeExpense: 'Expense', description: 'Sports activities' },
  { date: '2026-09-14', amount: 116, type: 'Health Insurance', incomeExpense: 'Expense', description: 'Health insurance' },
  { date: '2026-09-15', amount: 144, type: 'Medical Expenses', incomeExpense: 'Expense', description: 'Doctor or pharmacy' },
  { date: '2026-09-16', amount: 20, type: 'Supplements', incomeExpense: 'Expense', description: 'Vitamins & supplements' },
  { date: '2026-09-17', amount: 397, type: 'Groceries', incomeExpense: 'Expense', description: 'Food shopping' },
  { date: '2026-09-18', amount: 257, type: 'Eating Out', incomeExpense: 'Expense', description: 'Restaurants & cafés' },
  { date: '2026-09-19', amount: 256, type: 'Entertainment', incomeExpense: 'Expense', description: 'Movies & events' },
  { date: '2026-09-20', amount: 756, type: 'Travel', incomeExpense: 'Expense', description: 'Trips & holidays' },
  { date: '2026-09-21', amount: 216, type: 'Other Expenses', incomeExpense: 'Expense', description: 'Miscellaneous' },
  // October
  { date: '2026-10-01', amount: 3848, type: 'Salary', incomeExpense: 'Income', description: 'Monthly salary' },
  { date: '2026-10-02', amount: 952, type: 'Side Hustle', incomeExpense: 'Income', description: 'Side project income' },
  { date: '2026-10-03', amount: 96, type: 'Interest / Dividends', incomeExpense: 'Income', description: 'Investment income' },
  { date: '2026-10-04', amount: 263, type: 'Gifts / Other', incomeExpense: 'Income', description: 'Gifts or irregular income' },
  { date: '2026-10-05', amount: 1100, type: 'Rent / Mortgage', incomeExpense: 'Expense', description: 'Monthly rent or mortgage' },
  { date: '2026-10-06', amount: 199, type: 'Utilities', incomeExpense: 'Expense', description: 'Electricity, water, internet' },
  { date: '2026-10-07', amount: 670, type: 'Property Tax', incomeExpense: 'Expense', description: 'Property tax payment' },
  { date: '2026-10-08', amount: 93, type: 'Household Goods', incomeExpense: 'Expense', description: 'Home supplies' },
  { date: '2026-10-09', amount: 420, type: 'Car Payment', incomeExpense: 'Expense', description: 'Car loan payment' },
  { date: '2026-10-10', amount: 148, type: 'Fuel', incomeExpense: 'Expense', description: 'Fuel costs' },
  { date: '2026-10-11', amount: 95, type: 'Public Transport', incomeExpense: 'Expense', description: 'Public transport' },
  { date: '2026-10-12', amount: 70, type: 'Taxis & Other', incomeExpense: 'Expense', description: 'Ride sharing & taxis' },
  { date: '2026-10-13', amount: 90, type: 'Sport', incomeExpense: 'Expense', description: 'Sports activities' },
  { date: '2026-10-14', amount: 125, type: 'Health Insurance', incomeExpense: 'Expense', description: 'Health insurance' },
  { date: '2026-10-15', amount: 201, type: 'Medical Expenses', incomeExpense: 'Expense', description: 'Doctor or pharmacy' },
  { date: '2026-10-16', amount: 33, type: 'Supplements', incomeExpense: 'Expense', description: 'Vitamins & supplements' },
  { date: '2026-10-17', amount: 483, type: 'Groceries', incomeExpense: 'Expense', description: 'Food shopping' },
  { date: '2026-10-18', amount: 312, type: 'Eating Out', incomeExpense: 'Expense', description: 'Restaurants & cafés' },
  { date: '2026-10-19', amount: 222, type: 'Entertainment', incomeExpense: 'Expense', description: 'Movies & events' },
  { date: '2026-10-20', amount: 127, type: 'Travel', incomeExpense: 'Expense', description: 'Trips & holidays' },
  { date: '2026-10-21', amount: 108, type: 'Other Expenses', incomeExpense: 'Expense', description: 'Miscellaneous' },
  // November
  { date: '2026-11-01', amount: 3848, type: 'Salary', incomeExpense: 'Income', description: 'Monthly salary' },
  { date: '2026-11-02', amount: 727, type: 'Side Hustle', incomeExpense: 'Income', description: 'Side project income' },
  { date: '2026-11-03', amount: 136, type: 'Interest / Dividends', incomeExpense: 'Income', description: 'Investment income' },
  { date: '2026-11-04', amount: 83, type: 'Gifts / Other', incomeExpense: 'Income', description: 'Gifts or irregular income' },
  { date: '2026-11-05', amount: 1100, type: 'Rent / Mortgage', incomeExpense: 'Expense', description: 'Monthly rent or mortgage' },
  { date: '2026-11-06', amount: 134, type: 'Utilities', incomeExpense: 'Expense', description: 'Electricity, water, internet' },
  { date: '2026-11-07', amount: 348, type: 'Property Tax', incomeExpense: 'Expense', description: 'Property tax payment' },
  { date: '2026-11-08', amount: 233, type: 'Household Goods', incomeExpense: 'Expense', description: 'Home supplies' },
  { date: '2026-11-09', amount: 420, type: 'Car Payment', incomeExpense: 'Expense', description: 'Car loan payment' },
  { date: '2026-11-10', amount: 96, type: 'Fuel', incomeExpense: 'Expense', description: 'Fuel costs' },
  { date: '2026-11-11', amount: 66, type: 'Public Transport', incomeExpense: 'Expense', description: 'Public transport' },
  { date: '2026-11-12', amount: 20, type: 'Taxis & Other', incomeExpense: 'Expense', description: 'Ride sharing & taxis' },
  { date: '2026-11-13', amount: 112, type: 'Sport', incomeExpense: 'Expense', description: 'Sports activities' },
  { date: '2026-11-14', amount: 109, type: 'Health Insurance', incomeExpense: 'Expense', description: 'Health insurance' },
  { date: '2026-11-15', amount: 274, type: 'Medical Expenses', incomeExpense: 'Expense', description: 'Doctor or pharmacy' },
  { date: '2026-11-16', amount: 32, type: 'Supplements', incomeExpense: 'Expense', description: 'Vitamins & supplements' },
  { date: '2026-11-17', amount: 453, type: 'Groceries', incomeExpense: 'Expense', description: 'Food shopping' },
  { date: '2026-11-18', amount: 307, type: 'Eating Out', incomeExpense: 'Expense', description: 'Restaurants & cafés' },
  { date: '2026-11-19', amount: 126, type: 'Entertainment', incomeExpense: 'Expense', description: 'Movies & events' },
  { date: '2026-11-20', amount: 144, type: 'Travel', incomeExpense: 'Expense', description: 'Trips & holidays' },
  { date: '2026-11-21', amount: 283, type: 'Other Expenses', incomeExpense: 'Expense', description: 'Miscellaneous' },
  // December
  { date: '2026-12-01', amount: 3848, type: 'Salary', incomeExpense: 'Income', description: 'Monthly salary' },
  { date: '2026-12-02', amount: 1070, type: 'Side Hustle', incomeExpense: 'Income', description: 'Side project income' },
  { date: '2026-12-03', amount: 99, type: 'Interest / Dividends', incomeExpense: 'Income', description: 'Investment income' },
  { date: '2026-12-04', amount: 129, type: 'Gifts / Other', incomeExpense: 'Income', description: 'Gifts or irregular income' },
  { date: '2026-12-05', amount: 1100, type: 'Rent / Mortgage', incomeExpense: 'Expense', description: 'Monthly rent or mortgage' },
  { date: '2026-12-06', amount: 164, type: 'Utilities', incomeExpense: 'Expense', description: 'Electricity, water, internet' },
  { date: '2026-12-07', amount: 616, type: 'Property Tax', incomeExpense: 'Expense', description: 'Property tax payment' },
  { date: '2026-12-08', amount: 173, type: 'Household Goods', incomeExpense: 'Expense', description: 'Home supplies' },
  { date: '2026-12-09', amount: 420, type: 'Car Payment', incomeExpense: 'Expense', description: 'Car loan payment' },
  { date: '2026-12-10', amount: 150, type: 'Fuel', incomeExpense: 'Expense', description: 'Fuel costs' },
  { date: '2026-12-11', amount: 67, type: 'Public Transport', incomeExpense: 'Expense', description: 'Public transport' },
  { date: '2026-12-12', amount: 34, type: 'Taxis & Other', incomeExpense: 'Expense', description: 'Ride sharing & taxis' },
  { date: '2026-12-13', amount: 148, type: 'Sport', incomeExpense: 'Expense', description: 'Sports activities' },
  { date: '2026-12-14', amount: 131, type: 'Health Insurance', incomeExpense: 'Expense', description: 'Health insurance' },
  { date: '2026-12-15', amount: 238, type: 'Medical Expenses', incomeExpense: 'Expense', description: 'Doctor or pharmacy' },
  { date: '2026-12-16', amount: 81, type: 'Supplements', incomeExpense: 'Expense', description: 'Vitamins & supplements' },
  { date: '2026-12-17', amount: 483, type: 'Groceries', incomeExpense: 'Expense', description: 'Food shopping' },
  { date: '2026-12-18', amount: 229, type: 'Eating Out', incomeExpense: 'Expense', description: 'Restaurants & cafés' },
  { date: '2026-12-19', amount: 141, type: 'Entertainment', incomeExpense: 'Expense', description: 'Movies & events' },
  { date: '2026-12-20', amount: 295, type: 'Travel', incomeExpense: 'Expense', description: 'Trips & holidays' },
  { date: '2026-12-21', amount: 86, type: 'Other Expenses', incomeExpense: 'Expense', description: 'Miscellaneous' },
];

function generateId() {
  return Math.random().toString(36).substring(2, 11);
}

function loadTransactions(): Transaction[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return INITIAL_DATA.map(t => ({ ...t, id: generateId() }));
}

function save(transactions: Transaction[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
}

export function useFinanceStore() {
  const [transactions, setTransactions] = useState<Transaction[]>(loadTransactions);

  const addTransaction = useCallback((data: Omit<Transaction, 'id'>) => {
    setTransactions(prev => {
      const next = [...prev, { ...data, id: generateId() }];
      save(next);
      return next;
    });
  }, []);

  const updateTransaction = useCallback((id: string, data: Partial<Omit<Transaction, 'id'>>) => {
    setTransactions(prev => {
      const next = prev.map(t => t.id === id ? { ...t, ...data } : t);
      save(next);
      return next;
    });
  }, []);

  const deleteTransaction = useCallback((id: string) => {
    setTransactions(prev => {
      const next = prev.filter(t => t.id !== id);
      save(next);
      return next;
    });
  }, []);

  const reorderTransactions = useCallback((ids: string[]) => {
    setTransactions(prev => {
      const map = new Map(prev.map(t => [t.id, t]));
      const next = ids.map(id => map.get(id)!).filter(Boolean);
      // append any not in ids (shouldn't happen but safety)
      const idSet = new Set(ids);
      prev.forEach(t => { if (!idSet.has(t.id)) next.push(t); });
      save(next);
      return next;
    });
  }, []);

  return { transactions, addTransaction, updateTransaction, deleteTransaction, reorderTransactions };
}
