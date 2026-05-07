import React, { useState, useEffect } from 'react';
import DataTable from '../../components/DataTable';
import CreatePlan from './CreatePlan';
import PlanProfile from './PlanProfile';
import white_circle from '@/assets/plus-circle-white.svg';
import black_circle from '@/assets/plus-circle-black.svg';

export default function Plans({ user }) {
  const [plans, setPlans] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const token = localStorage.getItem('token');

  // Fetch plans from API
  const fetchPlans = () => {
    fetch('/api/plans', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setPlans(data.data || []))
      .catch(err => {
        console.error(err);
        setPlans([]);
      });
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const columns = [
  { key: 'name', label: 'Plan Name' },
  { key: 'program_name', label: 'Program' },
  { key: 'duration', label: 'Duration', searchable: false },
  { key: 'price', label: 'Price', searchable: false },
  { key: 'is_promo', label: 'Promo', searchable: false, render: row => (row.is_promo ? 'Yes' : 'No') },
  {
  key: 'promo_details',
  label: 'Promo Details',
  searchable: false,
  render: row => row.is_promo
    ? (
      <div className="text-sm">
        <div><span className="font-medium">Start:</span> {row.promo_start_date_display}</div>
        <div><span className="font-medium">End:</span> {row.promo_end_date_display}</div>
        <div>
          <span className="font-medium">Slots:</span> {row.subscribed_count} / {row.max_slots}
        </div>
      </div>
    )
    : <span className="text-gray-400">—</span>,
},
  {
    key: 'is_active',
    label: 'Status',
    type: 'badge',
    badgeColors: {
      active: 'bg-emerald-100 text-emerald-700',
      inactive: 'bg-rose-100 text-rose-700',
    },
    searchable: false,
    render: row => (row.is_active ? 'active' : 'inactive'),
  },
  ];

  return (
    <div className="flex">
      <main className="flex-1 p-5">
        <div className="flex justify-between items-center mb-4">
          <h1 style={{ fontFamily: 'var(--font-verdana)' }} className="text-2xl font-bold leading-none">Plans</h1>

          <button
            onClick={() => setShowCreate(true)}
            className="bg-[#03023B] font-verdana text-white px-4 h-10 flex items-center justify-center rounded mt-5 gap-2 relative group hover:text-black hover:bg-[#FFDE59]"
          >
            Add Plan
            <span className="w-5 h-5 relative inline-block">
              <img
                src={white_circle}
                alt="white circle"
                className="absolute top-0 left-0 w-5 h-5 opacity-100 group-hover:opacity-0"
              />
              <img
                src={black_circle}
                alt="black circle"
                className="absolute top-0 left-0 w-5 h-5 opacity-0 group-hover:opacity-100"
              />
            </span>
          </button>
        </div>

        {/* Create Plan Modal */}
        {showCreate && (
          <CreatePlan
            token={token}
            onSuccess={() => {
              setShowCreate(false);
              fetchPlans();
            }}
            onClose={() => setShowCreate(false)}
          />
        )}

        {/* Edit/Delete Plan Modal */}
        {selectedPlan && (
          <PlanProfile
            plan={selectedPlan}
            token={token}
            onSuccess={() => {
              setSelectedPlan(null);
              fetchPlans();
            }}
            onClose={() => setSelectedPlan(null)}
          />
        )}

        <DataTable
          data={plans.map(plan => ({
            ...plan,
            // Changed: join all program names instead of plan.program?.name
            program_name: plan.programs?.map(p => p.name).join(', ') || 'N/A',
            duration: `${plan.duration_days} days`,
            price: plan.price.toFixed(2),
            is_promo: plan.is_promo === true || plan.is_promo === 1 || plan.is_promo === "1",
            is_active: plan.is_active ? 'Active' : 'Inactive',
            subscribed_count: plan.training_subscriptions_count ?? 0,
            promo_start_date: plan.promo_start_date,
            promo_start_date_display: plan.promo_start_date ? new Date(plan.promo_start_date).toLocaleDateString() : "-",
            promo_end_date: plan.promo_end_date,
            promo_end_date_display: plan.promo_end_date ? new Date(plan.promo_end_date).toLocaleDateString() : "-",
          }))}
          columns={columns}
          itemsPerPage={10}
          onRowClick={(row) => setSelectedPlan({
            ...row,
            // Changed: pass programs array through so PlanProfile can read it
            programs: row.programs || [],
            is_active: row.is_active === 'Active',
            is_promo: !!row.is_promo,
          })}
        />
      </main>
    </div>
  );
}