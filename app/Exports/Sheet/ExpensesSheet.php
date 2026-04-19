<?php

namespace App\Exports\Sheet;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithTitle;

class ExpensesSheet implements FromArray, WithTitle
{
    protected $expenses;

    public function __construct($expenses)
    {
        $this->expenses = $expenses;
    }

    public function array(): array
    {
        $rows = [
            ['ID', 'Date', 'Type', 'Description', 'Amount'],
        ];

        foreach ($this->expenses as $expense) {
            $rows[] = [
                $expense->id,
                $expense->exp_date?->format('Y-m-d') ?? '',
                $expense->exp_type,
                $expense->description,
                $expense->exp_amount,
            ];
        }

        return $rows;
    }

    public function title(): string
    {
        return 'Expenses';
    }
}
