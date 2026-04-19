<?php

namespace App\Exports\Sheet;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithTitle;

class PaymentsSheet implements FromArray, WithTitle
{
    protected $payments;

    public function __construct($payments)
    {
        $this->payments = $payments;
    }

    public function array(): array
    {
        $rows = [
            ['ID', 'Member', 'Date', 'Amount', 'Payment Method', 'Payment Type', 'Notes'],
        ];

        foreach ($this->payments as $payment) {
            $memberName = $payment->member ? trim($payment->member->first_name . ' ' . $payment->member->last_name) : 'Guest';

            $rows[] = [
                $payment->id,
                $memberName,
                $payment->payment_date?->format('Y-m-d') ?? '',
                $payment->amount,
                $payment->payment_method,
                $payment->payment_type,
                $payment->notes,
            ];
        }

        return $rows;
    }

    public function title(): string
    {
        return 'Payments';
    }
}
