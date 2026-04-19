<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Member;
use App\Models\Payment;
use App\Models\WalkIn;
use App\Exports\GymReportExport;
use Maatwebsite\Excel\Facades\Excel;
use Carbon\Carbon;
use Illuminate\Http\Request;

class MemberController extends Controller
{
    public function index()
    {
    return response()->json(['data' => Member::orderBy('created_at', 'desc')->get()]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'first_name' => 'required|string',
            'last_name'  => 'required|string',
            'facebook'   => 'nullable|string|max:255',
            'email'      => 'required|email|unique:members,email',
            'phone'      => 'nullable|string',
            'status'     => 'required|string',
        ]);

        $member = Member::create($validated);

        return response()->json(['data' => $member], 201);
    }

    public function show(Member $member)
    {
        $member->load([
            'membership',
            'trainingSubscriptions.plan.programs',
        ]);

        // Fetch walk-ins for this member
        $walkIns = WalkIn::where('member_id', $member->id)
            ->orderBy('date', 'desc')
            ->get()
            ->map(fn($w) => [
                'id'             => $w->id,
                'date'           => $w->date?->format('Y-m-d'),
                'amount'         => $w->amount,
                'has_membership' => $w->has_membership,
                'notes'          => $w->notes,
            ]);

        return response()->json([
            'id'         => $member->id,
            'first_name' => $member->first_name,
            'last_name'  => $member->last_name,
            'facebook'   => $member->facebook,
            'email'      => $member->email,
            'phone'      => $member->phone,
            'status'     => $member->status,
            'membership' => $member->membership ? [
                'type'       => $member->membership->type,
                'start_date' => $member->membership->start_date?->format('Y-m-d'),
                'end_date'   => $member->membership->end_date?->format('Y-m-d'),
            ] : null,
            'training_subscriptions' => $member->trainingSubscriptions->map(function ($sub) {
                return [
                    'id'         => $sub->id,
                    'status'     => $sub->status,
                    'start_date' => $sub->start_date?->format('Y-m-d'),
                    'end_date'   => $sub->end_date?->format('Y-m-d'),
                    'plan'       => $sub->plan ? [
                        'id'            => $sub->plan->id,
                        'name'          => $sub->plan->name,
                        'duration_days' => $sub->plan->duration_days,
                        'price'         => $sub->plan->price,
                        'program'       => $sub->plan->program ? [
                            'id'   => $sub->plan->program->id,
                            'name' => $sub->plan->program->name,
                        ] : null,
                    ] : null,
                ];
            }),
            'walk_ins' => $walkIns,
        ]);
    }

    public function update(Request $request, Member $member)
    {
        $validated = $request->validate([
            'first_name' => 'required|string',
            'last_name'  => 'required|string',
            'facebook'   => 'nullable|string|max:255',
            'email'      => 'required|email|unique:members,email,' . $member->id,
            'phone'      => 'nullable|string',
            'status'     => 'required|string',
        ]);

        $member->update($validated);
        return response()->json($member);
    }

    public function destroy(Member $member)
    {
        $member->delete();
        return response()->json(null, 204);
    }

    public function withoutMembership(Request $request)
    {
        $members = Member::where('status', 'Active')
            ->whereDoesntHave('membership')
            ->get(['id', 'first_name', 'last_name', 'status']);

        return response()->json(['data' => $members]);
    }

    public function withMembership()
    {
        $members = Member::where('status', 'Active')
            ->whereHas('membership')
            ->get(['id', 'first_name', 'last_name']);

        return response()->json(['data' => $members]);
    }

    public function exportReport()
    {
        $now     = Carbon::now();
        $members = Member::all();

        $monthlyRevenue = Payment::whereMonth('payment_date', $now->month)
            ->whereYear('payment_date', $now->year)
            ->sum('amount');

        $annualRevenue = Payment::whereYear('payment_date', $now->year)
            ->sum('amount');

        $dashboardStats = [
            'members' => [
                'total_active'   => Member::where('status', 'Active')->count(),
                'new_this_month' => Member::whereMonth('created_at', $now->month)
                                          ->whereYear('created_at', $now->year)
                                          ->count(),
            ],
            'revenue' => [
                'monthly_total' => $monthlyRevenue,
                'annual_total'  => $annualRevenue,
            ],
        ];

        return Excel::download(
            new GymReportExport($dashboardStats, $members),
            'gym_report.xlsx'
        );
    }
}