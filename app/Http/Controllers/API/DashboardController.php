<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Expense;
use App\Models\Member;
use App\Models\Membership;
use App\Models\Payment;
use App\Models\Plan;
use App\Models\TrainingSubscription;
use App\Models\WalkIn;
use Carbon\Carbon;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\GymReportExport;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $year = (int) $request->query('year', Carbon::now()->year);

        $now          = Carbon::now();
        $targetYear   = Carbon::createFromDate($year, 1, 1);
        $startOfMonth = $now->copy()->startOfMonth();
        $endOfMonth   = $now->copy()->endOfMonth();
        $expiryWindow = $now->copy()->addDays(10);

        $totalActive = Member::where('status', 'Active')->count();

        $annualMembers = Membership::where('type', 'annual')
            ->whereHas('member', fn($q) => $q->where('status', 'Active'))
            ->count();

        $walkInMembers = WalkIn::whereBetween('date', [$startOfMonth, $endOfMonth])
            ->count();

        $newMembersThisMonth = Member::whereBetween('created_at', [$startOfMonth, $endOfMonth])
            ->count();

        $monthlyRevenue = Payment::whereBetween('payment_date', [$startOfMonth, $endOfMonth])
            ->sum('amount');

        $annualRevenue = Payment::whereYear('payment_date', $now->year)
            ->sum('amount');

        // Revenue chart for selected year
        $revenueByMonth = Payment::selectRaw('MONTH(payment_date) as month, SUM(amount) as total')
            ->whereYear('payment_date', $year)
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->keyBy('month');

        // Expenses chart for selected year
        $expensesByMonth = Expense::selectRaw('MONTH(exp_date) as month, SUM(exp_amount) as total')
            ->whereRaw('YEAR(exp_date) = ?', [$year])
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->keyBy('month');

        $months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

        $revenueChart = collect(range(1, 12))->map(fn($m) => [
            'name'     => $months[$m - 1],
            'revenue'  => isset($revenueByMonth[$m])  ? (float) $revenueByMonth[$m]->total  : 0,
            'expenses' => isset($expensesByMonth[$m]) ? (float) $expensesByMonth[$m]->total : 0,
        ])->values();

        $expiringMemberships = Membership::with('member')
            ->whereNotNull('end_date')
            ->whereBetween('end_date', [$now->toDateString(), $expiryWindow->toDateString()])
            ->get()
            ->map(fn($m) => [
                'member_name' => $m->member ? $m->member->first_name . ' ' . $m->member->last_name : 'Unknown',
                'type'        => $m->type,
                'end_date'    => $m->end_date?->format('Y-m-d'),
                'days_left'   => (int) $now->diffInDays($m->end_date, false),
            ]);

        $expiringSubscriptions = TrainingSubscription::with(['member', 'plan'])
            ->where('status', 'active')
            ->whereBetween('end_date', [$now->toDateString(), $expiryWindow->toDateString()])
            ->get()
            ->map(fn($s) => [
                'member_name' => $s->member ? $s->member->first_name . ' ' . $s->member->last_name : 'Unknown',
                'plan_name'   => $s->plan?->name ?? 'Unknown Plan',
                'end_date'    => $s->end_date?->format('Y-m-d'),
                'days_left'   => (int) $now->diffInDays($s->end_date, false),
            ]);

        $recentPayments = Payment::with('member')
            ->orderBy('payment_date', 'desc')
            ->limit(5)
            ->get()
            ->map(fn($p) => [
                'member_name'    => $p->member ? $p->member->first_name . ' ' . $p->member->last_name : 'Guest',
                'amount'         => (float) $p->amount,
                'payment_date'   => $p->payment_date?->format('Y-m-d'),
                'payment_method' => $p->payment_method,
            ]);

        $promoPlans = Plan::with('trainingSubscriptions')
            ->where('is_promo', true)
            ->where('is_active', true)
            ->whereNotNull('max_slots')
            ->get()
            ->map(fn($p) => [
                'name'       => $p->name,
                'max_slots'  => $p->max_slots,
                'used_slots' => $p->trainingSubscriptions->count(),
                'slots_left' => max(0, $p->max_slots - $p->trainingSubscriptions->count()),
            ]);

        return response()->json([
            'data' => [
                'members' => [
                    'total_active'   => $totalActive,
                    'annual'         => $annualMembers,
                    'walk_in'        => $walkInMembers,
                    'new_this_month' => $newMembersThisMonth,
                ],
                'revenue' => [
                    'monthly_total' => (float) $monthlyRevenue,
                    'annual_total'  => (float) $annualRevenue,
                    'chart'         => $revenueChart,
                    'chart_year'    => $year,
                ],
                'expiring_memberships'   => $expiringMemberships,
                'expiring_subscriptions' => $expiringSubscriptions,
                'recent_payments'        => $recentPayments,
                'promo_plans'            => $promoPlans,
            ]
        ]);
    }

    private function getDashboardData()
    {
        $now          = Carbon::now();
        $startOfMonth = $now->copy()->startOfMonth();
        $endOfMonth   = $now->copy()->endOfMonth();
        $startOfYear  = $now->copy()->startOfYear();

        $totalActive = Member::where('status', 'Active')->count();

        $annualMembers = Membership::where('type', 'annual')
            ->whereHas('member', fn($q) => $q->where('status', 'Active'))
            ->count();

        $walkInMembers = WalkIn::where('has_membership', '0')->count();

        $newMembersThisMonth = Member::whereBetween('created_at', [$startOfMonth, $endOfMonth])
            ->count();

        $monthlyRevenue = Payment::whereBetween('payment_date', [$startOfMonth, $endOfMonth])
            ->sum('amount');

        $annualRevenue = Payment::whereBetween('payment_date', [$startOfYear, $now])
            ->sum('amount');

        $monthlyExpenses = Expense::whereBetween('exp_date', [$startOfMonth, $endOfMonth])
            ->sum('exp_amount');

        $annualExpenses = Expense::whereBetween('exp_date', [$startOfYear, $now])
            ->sum('exp_amount');

        $activeTrainingSubscriptions = TrainingSubscription::where('status', 'active')->count();

        return [
            'members' => [
                'total_active'   => $totalActive,
                'annual'         => $annualMembers,
                'walk_in'        => $walkInMembers,
                'new_this_month' => $newMembersThisMonth,
                'active_training_subscriptions' => $activeTrainingSubscriptions,
            ],
            'revenue' => [
                'monthly_total'    => (float) $monthlyRevenue,
                'annual_total'     => (float) $annualRevenue,
                'monthly_expenses' => (float) $monthlyExpenses,
                'annual_expenses'  => (float) $annualExpenses,
                'annual_balance'   => (float) ($annualRevenue - $annualExpenses),
            ]
        ];
    }

    public function exportFullReport()
    {
        $dashboardStats = $this->getDashboardData();
        $members        = Member::with('membership')
            ->withCount('trainingSubscriptions')
            ->get();
        $expenses = Expense::orderBy('exp_date', 'desc')->get();
        $payments = Payment::with('member')
            ->orderBy('payment_date', 'desc')
            ->get();
        $trainingSubscriptions = TrainingSubscription::with(['member', 'plan'])
            ->orderBy('end_date', 'desc')
            ->get();

        return Excel::download(
            new GymReportExport($dashboardStats, $members, $expenses, $payments, $trainingSubscriptions),
            'gym_report.xlsx'
        );
    }
}