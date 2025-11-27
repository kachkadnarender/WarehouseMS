import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function SalesOrders() {
  const { user, logout } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [customerName, setCustomerName] = useState('');
  const [items, setItems] = useState([
    { productId: '', quantity: '', unitPrice: '' },
  ]);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');

  const loadData = async () => {
  setLoading(true);
  setLoadError('');

  try {
    const [prodRes, soRes] = await Promise.all([
      axios.get('/api/products'),
      axios.get('/api/sales-orders'),
    ]);
    setProducts(prodRes.data);
    setOrders(soRes.data);
  } catch (err) {
    if (err.response?.status === 403) {
      setLoadError('Only ADMIN can see sales orders.');
    } else {
      setLoadError('Failed to load sales orders or products.');
    }
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  const addItemRow = () => {
    setItems((prev) => [...prev, { productId: '', quantity: '', unitPrice: '' }]);
  };

  const removeItemRow = (index) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const updateItemField = (index, field, value) => {
    setItems((prev) =>
      prev.map((row, i) =>
        i === index ? { ...row, [field]: value } : row
      )
    );
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveError('');
    setSaveSuccess('');

    const cleanedItems = items
      .filter((i) => i.productId && Number(i.quantity) > 0)
      .map((i) => ({
        productId: Number(i.productId),
        quantity: Number(i.quantity),
        unitPrice: Number(i.unitPrice) || 0,
      }));

    if (!customerName.trim()) {
      setSaveError('Customer name is required.');
      setSaving(false);
      return;
    }

    if (cleanedItems.length === 0) {
      setSaveError('Add at least one item with quantity.');
      setSaving(false);
      return;
    }

    const payload = {
      customerName,
      items: cleanedItems,
    };

    try {
      const res = await axios.post('/api/sales-orders', payload);
      setSaveSuccess(`SO ${res.data.soNumber} created.`);
      setCustomerName('');
      setItems([{ productId: '', quantity: '', unitPrice: '' }]);
      await loadData();
    } catch (err) {
      setSaveError(err.response?.data || 'Failed to create sales order.');
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmOrder = async (id) => {
    if (!window.confirm('Confirm this SO and reduce stock?')) return;

    try {
      await axios.post(`/api/sales-orders/${id}/confirm`);
      await loadData();
    } catch (err) {
      alert(err.response?.data || 'Failed to confirm sales order.');
    }
  };

  const formatDate = (val) => {
    if (!val) return '-';
    const d = new Date(val);
    if (Number.isNaN(d.getTime())) return val;
    return d.toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* NAVBAR */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-6">
              <h1 className="text-2xl font-bold text-gray-800">Sales Orders</h1>
              <div className="flex gap-3 text-sm">
                <Link to="/" className="text-gray-600 hover:text-gray-900">
                  Dashboard
                </Link>
                <Link to="/purchase-orders" className="text-gray-600 hover:text-gray-900">
                  Purchase Orders
                </Link>
                <Link
                  to="/sales-orders"
                  className="text-indigo-600 font-semibold"
                >
                  Sales Orders
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-right">
                <div>
                  <span className="text-gray-600">Welcome, </span>
                  <span className="font-semibold text-gray-900">
                    {user?.username}
                  </span>
                </div>
                <div>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                    {user?.role}
                  </span>
                </div>
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

      {/* CONTENT */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {!isAdmin && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
            Only <strong>ADMIN</strong> can manage sales orders.
          </div>
        )}

        {/* SO LIST */}
        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Sales Orders</h2>

          {loading ? (
            <p className="text-gray-500">Loading...</p>
          ) : loadError ? (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md text-sm">
              {loadError}
            </div>
          ) : orders.length === 0 ? (
            <p className="text-gray-500 text-sm">
              No sales orders yet. Create one using the form below.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm text-left">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 font-medium text-gray-700">ID</th>
                    <th className="px-4 py-2 font-medium text-gray-700">SO Number</th>
                    <th className="px-4 py-2 font-medium text-gray-700">Customer</th>
                    <th className="px-4 py-2 font-medium text-gray-700">Status</th>
                    <th className="px-4 py-2 font-medium text-gray-700">Created</th>
                    <th className="px-4 py-2 font-medium text-gray-700">Confirmed</th>
                    <th className="px-4 py-2 font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {orders.map((so) => (
                    <tr key={so.id}>
                      <td className="px-4 py-2">{so.id}</td>
                      <td className="px-4 py-2 font-mono">{so.soNumber}</td>
                      <td className="px-4 py-2">{so.customerName}</td>
                      <td className="px-4 py-2">
                        <span className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-800">
                          {so.status}
                        </span>
                      </td>
                      <td className="px-4 py-2">{formatDate(so.createdAt)}</td>
                      <td className="px-4 py-2">{formatDate(so.confirmedAt)}</td>
                      <td className="px-4 py-2">
                        {so.status === 'NEW' && (
                          <button
                            onClick={() => handleConfirmOrder(so.id)}
                            className="px-3 py-1 text-xs bg-green-600 text-white rounded-md hover:bg-green-700"
                          >
                            Confirm &amp; Reduce Stock
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* CREATE SO FORM */}
        {isAdmin && (
          <section className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Create Sales Order
            </h2>

            {saveError && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md text-sm mb-3">
                {saveError}
              </div>
            )}
            {saveSuccess && (
              <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded-md text-sm mb-3">
                {saveSuccess}
              </div>
            )}

            {products.length === 0 ? (
              <p className="text-gray-500 text-sm">
                You need products before creating sales orders.
              </p>
            ) : (
              <form className="space-y-4" onSubmit={handleCreateOrder}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input
                    type="text"
                    placeholder="Customer Name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-3">
                  <h3 className="font-medium text-gray-800">Items</h3>
                  {items.map((row, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-1 md:grid-cols-4 gap-3 items-center"
                    >
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={row.productId}
                        onChange={(e) =>
                          updateItemField(index, 'productId', e.target.value)
                        }
                      >
                        <option value="">Select Product</option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} ({p.sku})
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        min="1"
                        placeholder="Quantity"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={row.quantity}
                        onChange={(e) =>
                          updateItemField(index, 'quantity', e.target.value)
                        }
                      />
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="Unit Price"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={row.unitPrice}
                        onChange={(e) =>
                          updateItemField(index, 'unitPrice', e.target.value)
                        }
                      />
                      <div className="flex gap-2">
                        {items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeItemRow(index)}
                            className="px-3 py-2 text-xs bg-red-100 text-red-700 rounded-md hover:bg-red-200"
                          >
                            Remove
                          </button>
                        )}
                        {index === items.length - 1 && (
                          <button
                            type="button"
                            onClick={addItemRow}
                            className="px-3 py-2 text-xs bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                          >
                            + Add Item
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="mt-3 px-4 py-2 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700 disabled:opacity-50"
                >
                  {saving ? 'Creating...' : 'Create Sales Order'}
                </button>
              </form>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
