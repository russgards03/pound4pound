<?php

namespace App\Exports\Sheet;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithTitle;

class MembersSheet implements FromArray, WithTitle
{
    protected $members;

    public function __construct($members)
    {
        $this->members = $members;
    }

    public function array(): array
    {
        $rows = [
            ['ID', 'First Name', 'Last Name', 'Email', 'Phone', 'Status', 'Joined At', 'Membership Type', 'Membership Start', 'Membership End', 'Training Subscriptions']
        ];

        foreach ($this->members as $m) {
            $rows[] = [
                $m->id,
                $m->first_name,
                $m->last_name,
                $m->email,
                $m->phone,
                $m->status,
                $m->created_at?->format('Y-m-d') ?? '',
                $m->membership?->type ?? 'None',
                $m->membership?->start_date?->format('Y-m-d') ?? '',
                $m->membership?->end_date?->format('Y-m-d') ?? '',
                $m->training_subscriptions_count ?? ($m->trainingSubscriptions ? $m->trainingSubscriptions->count() : 0),
            ];
        }

        return $rows;
    }

    public function title(): string
    {
        return 'Members';
    }
}