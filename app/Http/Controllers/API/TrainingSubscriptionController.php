<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\TrainingSubscription;
use App\Models\Member;
use App\Models\Plan;
use App\Models\Payment;
use Illuminate\Http\Request;

class TrainingSubscriptionController extends Controller
{
    public function index()
    {
        $subscriptions = TrainingSubscription::with(['member', 'plan.programs'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn($sub) => $this->format($sub));

        return response()->json(['data' => $subscriptions]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'member_id' => 'required|exists:members,id',
            'plan_id'   => 'required|exists:plans,id',
        ]);

        $member = Member::findOrFail($validated['member_id']);
        $plan   = Plan::findOrFail($validated['plan_id']);

        $membership = $member->membership()->first();

        if (!$membership) {
            return response()->json(['message' => 'Member does not have an active membership.'], 400);
        }

        if ($membership->type === 'annual' && $membership->end_date && $membership->end_date->lt(now())) {
            return response()->json(['message' => 'Member\'s annual membership has expired.'], 400);
        }

        if (!$plan->is_active) {
            return response()->json(['message' => 'Selected plan is not active.'], 400);
        }

        if ($plan->is_promo && $plan->max_slots !== null) {
            $currentCount = TrainingSubscription::where('plan_id', $plan->id)->count();
            if ($currentCount >= $plan->max_slots) {
                return response()->json(['message' => 'This plan has reached its maximum number of slots.'], 422);
            }
        }

        $existingSubscription = TrainingSubscription::where('member_id', $member->id)
            ->where('plan_id', $plan->id)
            ->first();

        if ($existingSubscription) {
            return response()->json(['message' => 'Member is already subscribed to this plan.'], 400);
        }

        $startDate = now();
        $endDate   = now()->addDays($plan->duration_days);

        $subscription = TrainingSubscription::create([
            'member_id'  => $member->id,
            'plan_id'    => $plan->id,
            'start_date' => $startDate,
            'end_date'   => $endDate,
            'status'     => 'active',
        ]);

        Payment::create([
            'member_id'      => $member->id,
            'amount'         => $plan->price,
            'payment_date'   => $startDate->format('Y-m-d'),
            'payment_type'   => 'training_subscription',
            'payment_method' => null,
            'notes'          => $plan->name,
            'proof'          => null,
        ]);

        return response()->json([
            'message' => 'Training subscription created successfully.',
            'data'    => $this->format($subscription->load('member', 'plan')),
        ], 201);
    }

    public function update(Request $request, TrainingSubscription $trainingSubscription)
    {
        $validated = $request->validate([
            'plan_id'    => 'required|exists:plans,id',
            'start_date' => 'required|date',
            'end_date'   => 'required|date|after:start_date',
        ]);

        $plan = Plan::findOrFail($validated['plan_id']);

        $trainingSubscription->update([
            'plan_id'    => $plan->id,
            'start_date' => $validated['start_date'],
            'end_date'   => $validated['end_date'],
        ]);

        return response()->json([
            'message' => 'Subscription updated successfully.',
            'data'    => $this->format($trainingSubscription->load('member', 'plan')),
        ]);
    }

    public function destroy(TrainingSubscription $trainingSubscription)
    {

        $trainingSubscription->delete();
        return response()->json(null, 204);
    }

    private function format(TrainingSubscription $sub): array
    {
        return [
            'id'         => $sub->id,
            'member'     => $sub->member ? [
                'id'         => $sub->member->id,
                'first_name' => $sub->member->first_name,
                'last_name'  => $sub->member->last_name,
            ] : null,
            'plan'       => $sub->plan ? [
                'id'    => $sub->plan->id,
                'name'  => $sub->plan->name,
                'price' => $sub->plan->price,
            ] : null,
            'start_date' => $sub->start_date?->format('Y-m-d'),
            'end_date'   => $sub->end_date?->format('Y-m-d'),
            'status'     => $sub->status ?? 'active',
        ];
    }
}