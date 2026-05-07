<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\WithMultipleSheets;
use App\Exports\Sheet\DashboardSheet;
use App\Exports\Sheet\MembersSheet;
use App\Exports\Sheet\ExpensesSheet;
use App\Exports\Sheet\PaymentsSheet;
use App\Exports\Sheet\TrainingSubscriptionsSheet;

class GymReportExport implements WithMultipleSheets
{
    protected $dashboardStats;
    protected $members;
    protected $expenses;
    protected $payments;
    protected $trainingSubscriptions;

    public function __construct($dashboardStats = [], $members = [], $expenses = [], $payments = [], $trainingSubscriptions = [])
    {
        $this->dashboardStats = $dashboardStats;
        $this->members = $members;
        $this->expenses = $expenses;
        $this->payments = $payments;
        $this->trainingSubscriptions = $trainingSubscriptions;
    }

    public function sheets(): array
    {
        return [
            new DashboardSheet($this->dashboardStats),
            new MembersSheet($this->members),
            new ExpensesSheet($this->expenses),
            new PaymentsSheet($this->payments),
            new TrainingSubscriptionsSheet($this->trainingSubscriptions),
        ];
    }
}