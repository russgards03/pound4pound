import React, { useState } from "react";

export default function CreateExpense({ token, onSuccess, onClose }) {
  const [formData, setFormData] = useState({
    description: "",
    exp_date: "",
    exp_type: "",
    exp_amount: "",
  });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Something went wrong.");
        return;
      }

      setMessage("Expense created successfully!");
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error(err);
      setMessage("Server error.");
    }
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/20 flex justify-center items-center z-50">
      <div className="font-verdana p-6 max-w-md w-full bg-white rounded shadow-md relative">

        {/* Close Button */}
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xl font-bold"
          onClick={onClose}
        >
          ✖
        </button>

        <h2 className="text-xl font-bold mb-4">Add New Expense</h2>
        {message && <p className="text-green-600 mb-3 text-center">{message}</p>}

        <form onSubmit={handleSubmit} className="flex flex-col space-y-3">
          <input
            type="text"
            name="description"
            placeholder="Description"
            value={formData.description}
            onChange={handleChange}
            className="px-3 py-2 border rounded"
            required
          />
          <input
            type="date"
            name="exp_date"
            value={formData.exp_date}
            onChange={handleChange}
            className="px-3 py-2 border rounded"
            required
          />
          <select
            name="exp_type"
            value={formData.exp_type}
            onChange={handleChange}
            className="px-3 py-2 border rounded"
            required
          >
            <option value="">Select Type</option>
            <option value="Utilities">Utilities</option>
            <option value="Rent">Rent</option>
            <option value="Equipment">Equipment</option>
            <option value="Maintenance">Maintenance</option>
            <option value="Supplies">Supplies</option>
            <option value="Other">Other</option>
          </select>
          <input
            type="number"
            name="exp_amount"
            placeholder="Amount"
            value={formData.exp_amount}
            onChange={handleChange}
            className="px-3 py-2 border rounded"
            required
          />

          <button
            type="submit"
            className="bg-[#03023B] text-white py-2 rounded hover:text-black hover:bg-[#FFDE59] transition"
          >
            Create Expense
          </button>
        </form>
      </div>
    </div>
  );
}