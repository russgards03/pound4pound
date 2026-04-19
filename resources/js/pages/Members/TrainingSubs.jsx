import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DataTable from '../../components/DataTable';
import CreateTrainingSubs from './CreateTrainingSubs';
import white_circle from '@/assets/plus-circle-white.svg';
import black_circle from '@/assets/plus-circle-black.svg';

export default function TrainingSubs() {
  const navigate = useNavigate();
  const [subscriptions, setSubscriptions] = useState([]);
  const [showForm, setShowForm] = useState(false);

  const token = localStorage.getItem('token');

  const fetchSubscriptions = () => {
    fetch('/api/training-subscriptions', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => res.json())
      .then(data => setSubscriptions(data.data || []))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const columns = [
    { key: 'member_name', label: 'Member Name' },
    { key: 'plan_name', label: 'Plan' },
    { key: 'start_date', label: 'Start Date' },
    { key: 'end_date', label: 'End Date' },
    { key: 'status', label: 'Status', type: 'badge', badgeColors: { active: 'bg-green-100 text-green-700', expired: 'bg-red-100 text-red-700' } },
  ];

  const tableData = subscriptions.map(sub => ({
    id: sub.id,
    member_id: sub.member?.id,
    member_name: sub.member ? `${sub.member.first_name} ${sub.member.last_name}` : 'Deleted Member',
    plan_name: sub.plan?.name || '-',
    start_date: sub.start_date || '-',
    end_date: sub.end_date || '-',
    status: sub.status ? sub.status.charAt(0).toUpperCase() + sub.status.slice(1) : 'Active',
  }));

  return (
    <div className="p-5">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Training Subscriptions</h1>

        <button
          onClick={() => setShowForm(true)}
          className="bg-[#03023B] font-verdana text-white px-4 h-10 flex items-center justify-center rounded gap-2 relative group hover:text-black hover:bg-[#FFDE59]"
        >
          Add Subscription
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

      {showForm && (
        <CreateTrainingSubs
          onClose={() => {
            setShowForm(false);
            fetchSubscriptions();
          }}
        />
      )}

      <DataTable
      data={tableData}
      columns={columns}
      itemsPerPage={10}
      onRowClick={(row) => navigate(`/members/${row.member_id}`)}
    />
    </div>
  );
}