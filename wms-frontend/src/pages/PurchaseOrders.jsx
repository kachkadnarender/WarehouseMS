import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function PurchaseOrders() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  // Form state
  const [form, setForm] = useState({
    vendorName: '',
    vendorEmail: '',           // 👈 NEW
    expectedDate: '',
    items: [
      {
        productId: '',
        quantity: '',
        unitPrice: '',
      },
    ],
  });

  const [products, setProducts] = useState([]);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const formatPrice = (v) =>
    v == null || isNaN(v) ? '$0.00' : `$${Number(v).toFixed(2)}`;

  const formatDate = (iso) => {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString();
  };

  const formatDateTime = (iso) => {
    if (!iso) return '';
    return new Date(iso).toLocaleString();
  };

  const renderStatusBadge = (status) => {
    const base = 'text-xs px-2 py-1 rounded-full';
    switch (status) {
      case 'DRAFT':
        return (
          <span className={`${base} bg-gray-100 text-gray-800`}>Draft</span>
        );
      case 'RECEIVED':
        return (
          <span className={`${base} bg-green-100 text-green-800`}>
            Received
          </span>
        );
      default:
        return (
          <span className={`${base} bg-blue-100 text-blue-800`}>
            {status}
          </span>
        );
    }
  };

  // Load existing POs and products for item dropdown
  const loadData = async () => {
    setLoading(true);
    setLoadError('');
    try {
      const [poRes, prodRes] = await Promise.all([
        axios.get('/api/purchase-orders'),
        axios.get('/api/products'),
      ]);
      setOrders(Array.isArray(poRes.data) ? poRes.data : []);
      setProducts(Array.isArray(prodRes.data) ? prodRes.data : []);
    } catch (err) {
      console.error('Failed to load purchase orders or products', err);
      setLoadError('Failed to load purchase orders or products.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadData();
    } else {
      setLoading(false);
      setOrders([]);
    }
  }, [isAdmin]);

  // Handle form changes
  const updateItem = (index, field, value) => {
    const updated = [...form.items];
    updated[index] = { ...updated[index], [field]: value };
    setForm((prev) => ({ ...prev, items: updated }));
  };

  const addItemRow = () => {
    setForm((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        { productId: '', quantity: '', unitPrice: '' },
      ],
    }));
  };

  const removeItemRow = (index) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const resetForm = () => {
    setForm({
      vendorName: '',
      vendorEmail: '',     // 👈 reset
      expectedDate: '',
      items: [
        {
          productId: '',
          quantity: '',
          unitPrice: '',
        },
      ],
    });
    setSaveError('');
    setSuccessMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveError('');
    setSuccessMessage('');

    const cleanedItems = form.items
      .filter((it) => it.productId && it.quantity)
      .map((it) => ({
        productId: Number(it.productId),
        quantity: Number(it.quantity),
        unitPrice: Number(it.unitPrice) || 0,
      }));

    if (cleanedItems.length === 0) {
      setSaveError('Please add at least one item with product and quantity.');
      setSaving(false);
      return;
    }

    const payload = {
      vendorName: form.vendorName,
      vendorEmail: form.vendorEmail,         // 👈 send vendor email
      expectedDate: form.expectedDate || null,
      items: cleanedItems,
    };

    try {
      const res = await axios.post('/api/purchase-orders', payload);
      setOrders((prev) => [...prev, res.data]);
      setSuccessMessage('Purchase order created successfully (email sent to vendor).');
      resetForm();
      await loadData();
    } catch (err) {
      console.error('Failed to create purchase order', err);
      setSaveError(err.response?.data || 'Failed to create purchase order.');
    } finally {
      setSaving(false);
    }
  };

  const handleReceive = async (id) => {
    if (!window.confirm('Mark this purchase order as RECEIVED and update stock?')) return;

    try {
      const res = await axios.post(`/api/purchase-orders/${id}/receive`);
      setOrders((prev) => prev.map((o) => (o.id === id ? res.data : o)));
    } catch (err) {
      console.error('Failed to mark as received', err);
      alert(err.response?.data || 'Failed to mark purchase order as received.');
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="max-w-5xl mx-auto px-4 py-8">
          <p className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
            Only ADMIN users can access Purchase Orders.
          </p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* NAV */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold text-gray-800">
                Purchase Orders
              </h1>
              <Link to="/" className="text-sm text-indigo-600 hover:underline">
                ← Back to Dashboard
              </Link>
            </div>
            <div className="text-sm text-gray-600">
              Logged in as{' '}
              <span className="font-semibold">{user?.username}</span> (
              {user?.role})
            </div>
          </div>
        </div>
      </nav>

      {/* CONTENT */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* List */}
        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Existing Purchase Orders
          </h2>

          {loading ? (
            <p className="text-gray-500">Loading purchase orders...</p>
          ) : loadError ? (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md text-sm">
              {loadError}
            </div>
          ) : orders.length === 0 ? (
            <p className="text-gray-500 text-sm">
              No purchase orders created yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm text-left">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 font-medium text-gray-700">ID</th>
                    <th className="px-4 py-2 font-medium text-gray-700">
                      PO Number
                    </th>
                    <th className="px-4 py-2 font-medium text-gray-700">
                      Vendor
                    </th>
                    <th className="px-4 py-2 font-medium text-gray-700">
                      Vendor Email
                    </th>
                    <th className="px-4 py-2 font-medium text-gray-700">
                      Expected
                    </th>
                    <th className="px-4 py-2 font-medium text-gray-700">
                      Status
                    </th>
                    <th className="px-4 py-2 font-medium text-gray-700">
                      Created
                    </th>
                    <th className="px-4 py-2 font-medium text-gray-700">
                      Received
                    </th>
                    <th className="px-4 py-2 font-medium text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {orders.map((o) => (
                    <tr key={o.id}>
                      <td className="px-4 py-2">{o.id}</td>
                      <td className="px-4 py-2 font-mono">{o.poNumber}</td>
                      <td className="px-4 py-2">{o.vendorName}</td>
                      <td className="px-4 py-2">{o.vendorEmail || '-'}</td>
                      <td className="px-4 py-2">
                        {o.expectedDate ? formatDate(o.expectedDate) : '-'}
                      </td>
                      <td className="px-4 py-2">
                        {renderStatusBadge(o.status)}
                      </td>
                      <td className="px-4 py-2">
                        {formatDateTime(o.createdAt)}
                      </td>
                      <td className="px-4 py-2">
                        {o.receivedAt ? formatDateTime(o.receivedAt) : '-'}
                      </td>
                      <td className="px-4 py-2">
                        {o.status !== 'RECEIVED' && (
                          <button
                            onClick={() => handleReceive(o.id)}
                            className="px-3 py-1 text-xs bg-green-600 text-white rounded-md hover:bg-green-700"
                          >
                            Mark Received
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

        {/* Create form */}
        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Create Purchase Order
          </h2>

          {saveError && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md text-sm mb-3">
              {saveError}
            </div>
          )}
          {successMessage && (
            <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded-md text-sm mb-3">
              {successMessage}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Vendor Name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none"
                value={form.vendorName}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    vendorName: e.target.value,
                  }))
                }
                required
              />
              <input
                type="email"
                placeholder="Vendor Email"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none"
                value={form.vendorEmail}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    vendorEmail: e.target.value,
                  }))
                }
              />
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none"
                value={form.expectedDate}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    expectedDate: e.target.value,
                  }))
                }
              />
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">
                Items
              </h3>
              <div className="space-y-3">
                {form.items.map((it, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-1 md:grid-cols-4 gap-3 items-center"
                  >
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={it.productId}
                      onChange={(e) =>
                        updateItem(index, 'productId', e.target.value)
                      }
                      required
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
                      value={it.quantity}
                      onChange={(e) =>
                        updateItem(index, 'quantity', e.target.value)
                      }
                      required
                    />

                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">$</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="Unit Price"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={it.unitPrice}
                        onChange={(e) =>
                          updateItem(index, 'unitPrice', e.target.value)
                        }
                      />
                    </div>

                    <div className="flex justify-end">
                      {form.items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItemRow(index)}
                          className="px-3 py-2 text-xs bg-red-100 text-red-700 rounded-md hover:bg-red-200"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={addItemRow}
                className="mt-3 px-3 py-2 text-xs bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200"
              >
                + Add Item
              </button>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Create Purchase Order'}
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}
