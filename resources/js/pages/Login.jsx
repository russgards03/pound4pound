import logo from '@/assets/logo.svg';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login({ user, setUser }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || 'Login failed');
        return;
      }

      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));

      setUser(data.data.user);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setMessage('Login error. Check console.');
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center pt-10 sm:pt-16 px-4"
      style={{ backgroundColor: '#03023B' }}
    >
      {/* Logo */}
      <img
        src={logo}
        alt="Pound for Pound Fitness"
        className="mb-6 h-16 sm:h-20"
      />

      <div
        className="flex flex-col items-center justify-center w-full max-w-[520px] py-10"
        style={{
          backgroundColor: '#F2F2F2',
          border: '5px solid #B63C2C',
          borderRadius: '70px',
        }}
      >
        <form onSubmit={handleSubmit} className="w-full px-8 sm:px-12">
          {/* Email */}
          <label className="font-bebas text-xl tracking-wider">
            EMAIL
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full mb-5 px-5 py-3 rounded-full border-2 border-black focus:outline-none"
          />

          {/* Password */}
          <label className="font-bebas text-xl tracking-wider">
            PASSWORD
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full mb-6 px-5 py-3 rounded-full border-2 border-black focus:outline-none"
          />

          {/* Login Button */}
          <button
            type="submit"
            className="w-full py-3 font-bebas text-xl tracking-wider"
            style={{
              backgroundColor: '#FFDE59',
              border: '5px solid #FFFFFF',
              borderRadius: '9999px',
            }}
          >
            LOGIN
          </button>

          {/* Register */}
          <p className="text-center w-full py-3 font-bebas underline text-lg tracking-wider">
            REGISTER
          </p>
        </form>

        {message && (
          <p className="mt-2 text-sm text-red-600 text-center px-8">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}