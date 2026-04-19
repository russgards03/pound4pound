import React, { useState, useEffect } from "react";

export default function PlanProfile({ plan, token, onSuccess, onClose }) {
  const [formData, setFormData] = useState({
    program_ids: [],
    name: "",
    duration_days: "",
    price: "",
    is_promo: false,
    promo_start_date: "",
    promo_end_date: "",
    max_slots: "",
    is_active: true,
  });
  const [programs, setPrograms] = useState([]);
  const [message, setMessage] = useState("");
  const [subscribers, setSubscribers] = useState([]);

  // Populate form when plan changes
  useEffect(() => {
    if (plan) {
      setFormData({
        program_ids: plan.programs ? plan.programs.map((p) => p.id) : [],
        name: plan.name,
        duration_days: plan.duration_days,
        price: plan.price,
        is_promo: plan.is_promo,
        promo_start_date: plan.promo_start_date
          ? plan.promo_start_date.split("T")[0]
          : "",
        promo_end_date: plan.promo_end_date
          ? plan.promo_end_date.split("T")[0]
          : "",
        max_slots: plan.max_slots || "",
        is_active: plan.is_active,
      });
    }
  }, [plan]);

  // Fetch subscribers
  useEffect(() => {
    if (plan?.id) {
      fetch(`/api/plans/${plan.id}/subscriptions`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => setSubscribers(data.data || []))
        .catch((err) => console.error(err));
    }
  }, [plan, token]);

  // Fetch programs
  useEffect(() => {
    fetch("/api/programs", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then((data) => setPrograms(data.data))
      .catch((err) => console.error(err));
  }, [token]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleProgramToggle = (id) => {
    setFormData((prev) => ({
      ...prev,
      program_ids: prev.program_ids.includes(id)
        ? prev.program_ids.filter((p) => p !== id)
        : [...prev.program_ids, id],
    }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setMessage("");

    if (formData.program_ids.length === 0) {
      setMessage("Please select at least one program.");
      return;
    }

    try {
      const payload = {
        ...formData,
        promo_start_date: formData.is_promo && formData.promo_start_date ? formData.promo_start_date : null,
        promo_end_date: formData.is_promo && formData.promo_end_date ? formData.promo_end_date : null,
        max_slots: formData.is_promo && formData.max_slots ? Number(formData.max_slots) : null,
        is_active: !!formData.is_active,
        is_promo: !!formData.is_promo,
      };

      const res = await fetch(`/api/plans/${plan.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Update failed");
        return;
      }

      setMessage("Plan updated successfully!");
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error(err);
      setMessage("Server error");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this plan?")) return;

    try {
      const res = await fetch(`/api/plans/${plan.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        alert("Failed to delete plan.");
        return;
      }

      alert("Plan deleted successfully!");
      onClose();
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error(err);
      alert("Server error.");
    }
  };

  const statusColors = {
    active: "bg-emerald-100 text-emerald-700",
    expired: "bg-rose-100 text-rose-700",
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/20 flex justify-center items-center z-50">
      <div className="flex gap-4 w-full max-w-3xl px-4">

        {/* Edit Plan Modal */}
        <div className="bg-white rounded-lg w-full max-w-md p-6 relative shadow-lg overflow-y-auto max-h-[90vh]">
          <button
            className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xl font-bold"
            onClick={onClose}
          >
            ✖
          </button>

          <h2 className="text-xl font-bold mb-4">Edit Plan</h2>
          {message && (
            <p className={`mb-3 text-center ${message.includes("successfully") ? "text-green-600" : "text-red-500"}`}>
              {message}
            </p>
          )}

          <form onSubmit={handleUpdate} className="flex flex-col space-y-3">

            {/* Program checkboxes */}
            <div className="border rounded px-3 py-2">
              <p className="text-sm font-medium mb-2 text-gray-600">Programs</p>
              <div className="flex flex-col gap-1 max-h-36 overflow-y-auto">
                {programs.map((p) => (
                  <label key={p.id} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.program_ids.includes(p.id)}
                      onChange={() => handleProgramToggle(p.id)}
                    />
                    {p.name}
                  </label>
                ))}
              </div>
            </div>

            <input
              type="text"
              name="name"
              placeholder="Plan Name"
              value={formData.name}
              onChange={handleChange}
              className="px-3 py-2 border rounded"
              required
            />
            <input
              type="number"
              name="duration_days"
              placeholder="Duration (days)"
              value={formData.duration_days}
              onChange={handleChange}
              className="px-3 py-2 border rounded"
              required
            />
            <input
              type="number"
              name="price"
              placeholder="Price"
              value={formData.price}
              onChange={handleChange}
              className="px-3 py-2 border rounded"
              required
            />

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="is_promo"
                checked={formData.is_promo}
                onChange={handleChange}
              />
              Is Promo (Limited Time)
            </label>

            {formData.is_promo && (
              <>
                <input
                  type="date"
                  name="promo_start_date"
                  value={formData.promo_start_date}
                  onChange={handleChange}
                  className="px-3 py-2 border rounded"
                  required
                />
                <input
                  type="date"
                  name="promo_end_date"
                  value={formData.promo_end_date}
                  onChange={handleChange}
                  className="px-3 py-2 border rounded"
                  required
                />
                <input
                  type="number"
                  name="max_slots"
                  placeholder="Max Redeemable Slots"
                  value={formData.max_slots}
                  onChange={handleChange}
                  className="px-3 py-2 border rounded"
                  required
                />
              </>
            )}

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
              />
              Is Active
            </label>

            <button
              type="submit"
              className="bg-[#03023B] text-white py-2 rounded hover:text-black hover:bg-[#FFDE59] transition"
            >
              Save Changes
            </button>

            <button
              type="button"
              onClick={handleDelete}
              className="bg-red-500 text-white py-2 rounded hover:bg-red-600"
            >
              Delete Plan
            </button>
          </form>
        </div>

        {/* Subscribers Panel */}
        <div className="bg-white rounded-lg w-full max-w-sm p-6 shadow-lg flex flex-col">
          <h2 className="text-xl font-bold mb-1">Subscribers</h2>

          {plan?.is_promo && plan?.max_slots && (
            <p className="text-sm text-gray-500 mb-3">
              {subscribers.length} / {plan.max_slots} slots used
            </p>
          )}

          {subscribers.length === 0 ? (
            <p className="text-gray-400 text-sm mt-4 text-center">No subscribers yet.</p>
          ) : (
            <div className="flex flex-col gap-2 overflow-y-auto max-h-96">
              {subscribers.map((sub) => (
                <div key={sub.id} className="border rounded p-3 text-sm">
                  <p className="font-medium">{sub.member_name}</p>
                  <p className="text-gray-500">
                    {sub.start_date} → {sub.end_date}
                  </p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[sub.status] || "bg-gray-100 text-gray-600"}`}>
                    {sub.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}