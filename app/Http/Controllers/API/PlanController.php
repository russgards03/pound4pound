<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Plan;
use Illuminate\Http\Request;

class PlanController extends Controller
{
    public function index()
    {
        try {
            $plans = Plan::with('programs')
                ->withCount('trainingSubscriptions')
                ->get();
            return response()->json(['data' => $plans]);
        } catch (\Exception $e) {
            \Log::error('PlanController@index error: ' . $e->getMessage());
            return response()->json(['message' => 'Server error'], 500);
        }
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'program_ids'      => 'required|array',
            'program_ids.*'    => 'exists:programs,id',
            'name'             => 'required|string|max:255',
            'duration_days'    => 'required|integer|min:1',
            'price'            => 'required|numeric|min:0',
            'is_promo'         => 'required|boolean',
            'promo_start_date' => 'nullable|date|required_if:is_promo,1',
            'promo_end_date'   => 'nullable|date|after:promo_start_date|required_if:is_promo,1',
            'max_slots'        => 'nullable|integer|min:1',
            'is_active'        => 'required|boolean',
        ]);

        $programIds = $validated['program_ids'];
        unset($validated['program_ids']);

        if (!$validated['is_promo']) {
            $validated['promo_start_date'] = null;
            $validated['promo_end_date']   = null;
            $validated['max_slots']        = null;
        }

        $plan = Plan::create($validated);
        $plan->programs()->sync($programIds);

        return response()->json([
            'message' => 'Plan created successfully.',
            'data'    => $plan->load('programs'),
        ], 201);
    }

    public function show($id)
    {
        $plan = Plan::with('programs')->findOrFail($id);
        return response()->json($plan);
    }

    public function update(Request $request, $id)
    {
        $plan = Plan::findOrFail($id);

        $validated = $request->validate([
            'program_ids'      => 'required|array',
            'program_ids.*'    => 'exists:programs,id',
            'name'             => 'required|string|max:255',
            'duration_days'    => 'required|integer|min:1',
            'price'            => 'required|numeric|min:0',
            'is_promo'         => 'required|boolean',
            'promo_start_date' => 'nullable|date|required_if:is_promo,1',
            'promo_end_date'   => 'nullable|date|after:promo_start_date|required_if:is_promo,1',
            'max_slots'        => 'nullable|integer|min:1',
            'is_active'        => 'required|boolean',
        ]);

        $programIds = $validated['program_ids'];
        unset($validated['program_ids']);

        if (!$validated['is_promo']) {
            $validated['promo_start_date'] = null;
            $validated['promo_end_date']   = null;
            $validated['max_slots']        = null;
        }

        $plan->update($validated);
        $plan->programs()->sync($programIds);

        return response()->json([
            'message' => 'Plan updated successfully.',
            'data'    => $plan->load('programs'),
        ]);
    }

    public function destroy($id)
    {
        $plan = Plan::findOrFail($id);
        $plan->delete();

        return response()->json(['message' => 'Plan deleted successfully.']);
    }

    public function subscriptions($id)
    {
        $plan = Plan::with(['trainingSubscriptions.member'])->findOrFail($id);

        $subscribers = $plan->trainingSubscriptions->map(function ($sub) {
            return [
                'id'          => $sub->id,
                'member_name' => $sub->member
                    ? $sub->member->first_name . ' ' . $sub->member->last_name
                    : 'Guest',
                'start_date'  => $sub->start_date?->format('Y-m-d'),
                'end_date'    => $sub->end_date?->format('Y-m-d'),
                'status'      => $sub->status,
            ];
        });

        return response()->json(['data' => $subscribers]);
    }
}