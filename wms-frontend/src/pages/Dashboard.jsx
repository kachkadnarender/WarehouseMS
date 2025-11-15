import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [data, setData] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get('/api/products');
        setData(res.data);
      } catch (err) {
        setData('Failed to load (check token)');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-2xl font-bold text-gray-800">WMS Admin</h1>
            <div className="flex items-center gap-4">
              <div className="text-sm">
                <span className="text-gray-600">Welcome,</span>{' '}
                <span className="font-semibold text-gray-900">{user?.username}</span>{' '}
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                  {user?.role}
                </span>
              </div>
              <button
                onClick={logout}
                className="px-4 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Protected Content</h2>
          {loading ? (
            <p className="text-gray-500">Loading...</p>
          ) : (
            <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-md">
              <strong>Success:</strong> {data}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}