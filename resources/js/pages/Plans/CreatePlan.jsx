import React, { useState, useEffect } from "react";

export default function CreatePlan({ token, onSuccess, onClose }) {
  const [programs, setPrograms] = useState([]);
  const [formData, setFormData] = useState({
    program_ids: [],
    name: "",
    duration_days: "",
    price: "",
    is_promo: false,
    promo_start_date: "",
    promo_end_date: "",
    max_slots: "",
  });
  const [message, setMessage] = useState("");

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (formData.program_ids.length === 0) {
      setMessage("Please select at least one program.");
      return;
    }

    try {
      const payload = {
        ...formData,
        is_active: true,
        promo_start_date: formData.is_promo ? formData.promo_start_date : null,
        promo_end_date: formData.is_promo ? formData.promo_end_date : null,
        max_slots: formData.is_promo ? Number(formData.max_slots) : null,
      };

      const res = await fetch("/api/plans", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Something went wrong.");
        return;
      }

      setMessage("Plan created successfully!");
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error(err);
      setMessage("Server error.");
    }
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/20 flex justify-center items-center z-50">
      <div className="font-verdana p-6 max-w-md w-full bg-white rounded shadow-md relative">
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xl font-bold"
          onClick={onClose}
        >
          ✖
        </button>

        <h2 className="text-xl font-bold mb-4">Create New Plan</h2>
        {message && (
          <p className={`mb-3 text-center ${message.includes('successfully') ? 'text-green-600' : 'text-red-500'}`}>
            {message}
          </p>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col space-y-3">

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

          <button
            type="submit"
            className="bg-[#03023B] text-white py-2 rounded hover:text-black hover:bg-[#FFDE59] transition"
          >
            Create Plan
          </button>
        </form>
      </div>
    </div>
  );
}