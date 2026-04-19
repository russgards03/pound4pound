<?php

namespace App\Exports\Sheet;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithTitle;

class TrainingSubscriptionsSheet implements FromArray, WithTitle
{
    protected $subscriptions;

    public function __construct($subscriptions)
    {
        $this->subscriptions = $subscriptions;
    }

    public function array(): array
    {
        $rows = [
            ['ID', 'Member', 'Plan', 'Status', 'Start Date', 'End Date', 'Days Remaining'],
        ];

        foreach ($this->subscriptions as $subscription) {
            $endDate = $subscription->end_date;
            $daysRemaining = 0;
            $memberName = $subscription->member ? trim($subscription->member->first_name . ' ' . $subscription->member->last_name) : 'Unknown';

            if ($endDate && $endDate->isFuture()) {
                $daysRemaining = $endDate->diffInDays(now());
            }

            $rows[] = [
                $subscription->id,
                $memberName,
                $subscription->plan?->name ?? 'N/A',
                $subscription->status,
                $subscription->start_date?->format('Y-m-d') ?? '',
                $subscription->end_date?->format('Y-m-d') ?? '',
                $daysRemaining,
            ];
        }

        return $rows;
    }

    public function title(): string
    {
        return 'Training Subs';
    }
}
