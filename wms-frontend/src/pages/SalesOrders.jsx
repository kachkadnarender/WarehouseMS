import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function SalesOrders() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  // Create order form
  const [form, setForm] = useState({
    customerName: '',
    customerEmail: '',
    items: [
      {
        productId: '',
        quantity: '',
        unitPrice: '',
      },
    ],
  });

  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [createSuccess, setCreateSuccess] = useState('');

  // Products for dropdown
  const [products, setProducts] = useState([]);

  // ----- Helpers -----
  const formatPrice = (v) => {
    if (v == null || isNaN(v)) return '$0.00';
    return `$${Number(v).toFixed(2)}`;
  };

  const formatDateTime = (iso) => {
    if (!iso) return '-';
    return new Date(iso).toLocaleString();
  };

  const renderStatusBadge = (status) => {
    let color = 'bg-gray-100 text-gray-800';
    if (status === 'NEW') color = 'bg-blue-100 text-blue-800';
    else if (status === 'CONFIRMED') color = 'bg-green-100 text-green-800';
    else if (status === 'CANCELLED') color = 'bg-red-100 text-red-800';
    else if (status === 'SHIPPED') color = 'bg-purple-100 text-purple-800';
    else if (status === 'COMPLETED') color = 'bg-emerald-100 text-emerald-800';

    return (
      <span className={`text-xs px-2 py-1 rounded-full ${color}`}>
        {status}
      </span>
    );
  };

  // ----- Load data -----
  const loadProducts = async () => {
    try {
      const res = await axios.get('/api/products');
      setProducts(res.data);
    } catch (err) {
      console.error('Failed to load products for SO form', err);
    }
  };

  const loadOrders = async () => {
    setLoading(true);
    setLoadError('');
    try {
      const res = await axios.get('/api/sales-orders');
      setOrders(res.data);
    } catch (err) {
      console.error('Failed to load sales orders', err);
      setLoadError('Failed to load sales orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadProducts();
      loadOrders();
    } else {
      setLoading(false);
      setLoadError('Only ADMIN can view sales orders.');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  // ----- Form handlers -----

  const handleItemChange = (index, field, value) => {
    const newItems = [...form.items];
    newItems[index] = {
      ...newItems[index],
      [field]: value,
    };
    setForm({ ...form, items: newItems });
  };

  const handleAddItemRow = () => {
    setForm({
      ...form,
      items: [
        ...form.items,
        {
          productId: '',
          quantity: '',
          unitPrice: '',
        },
      ],
    });
  };

  const handleRemoveItemRow = (index) => {
    const newItems = form.items.filter((_, i) => i !== index);
    if (newItems.length === 0) {
      // keep at least one empty row
      newItems.push({
        productId: '',
        quantity: '',
        unitPrice: '',
      });
    }
    setForm({ ...form, items: newItems });
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    setCreating(true);
    setCreateError('');
    setCreateSuccess('');

    // Build payload
    const payload = {
      customerName: form.customerName,
      customerEmail: form.customerEmail,
      items: form.items
        .filter((it) => it.productId && it.quantity)
        .map((it) => ({
          productId: Number(it.productId),
          quantity: Number(it.quantity) || 0,
          unitPrice: Number(it.unitPrice) || 0,
        })),
    };

    if (!payload.items.length) {
      setCreateError('At least one item with product & quantity is required.');
      setCreating(false);
      return;
    }

    try {
      const res = await axios.post('/api/sales-orders', payload);
      setOrders((prev) => [...prev, res.data]);
      setCreateSuccess('Sales order created successfully.');
      setForm({
        customerName: '',
        customerEmail: '',
        items: [
          {
            productId: '',
            quantity: '',
            unitPrice: '',
          },
        ],
      });
    } catch (err) {
      console.error('Create SO error', err);
      setCreateError(err.response?.data || 'Failed to create sales order.');
    } finally {
      setCreating(false);
    }
  };

  // ----- Confirm / Out-of-stock / Picking slip -----

  const handleConfirm = async (id) => {
    if (!window.confirm('Confirm this sales order and reduce stock?')) return;
    try {
      const res = await axios.post(`/api/sales-orders/${id}/confirm`);
      const updated = res.data;
      setOrders((prev) => prev.map((o) => (o.id === id ? updated : o)));
      alert('Sales order confirmed. Stock updated and email sent.');
    } catch (err) {
      console.error('Confirm SO error', err);
      alert(err.response?.data || 'Failed to confirm sales order.');
    }
  };

  const handleMarkOutOfStock = async (id) => {
    if (!window.confirm('Mark this sales order as OUT OF STOCK (cancel)?')) return;
    try {
      const res = await axios.post(`/api/sales-orders/${id}/out-of-stock`);
      const updated = res.data;
      setOrders((prev) => prev.map((o) => (o.id === id ? updated : o)));
      alert('Sales order marked as CANCELLED. Email sent to customer.');
    } catch (err) {
      console.error('Out-of-stock error', err);
      alert(err.response?.data || 'Failed to mark as out of stock.');
    }
  };

  const handleDownloadPickingSlip = async (id) => {
    try {
      const res = await axios.get(`/api/sales-orders/${id}/picking-slip`, {
        responseType: 'blob',
      });

      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `picking-slip-SO-${id}.pdf`;
      a.click();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Picking slip download error', err);
      alert('Failed to download picking slip.');
    }
  };

  // ----- Render -----

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-red-600">
              Only ADMIN users can access Sales Orders.
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* NAVBAR */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-6">
              <h1 className="text-2xl font-bold text-gray-800">
                Sales Orders
              </h1>
              <div className="hidden md:flex gap-4 text-sm">
                <Link to="/" className="text-gray-600 hover:text-gray-900">
                  Dashboard
                </Link>
                <Link
                  to="/purchase-orders"
                  className="text-gray-600 hover:text-gray-900"
                >
                  Purchase Orders
                </Link>
                <span className="text-indigo-600 font-semibold">
                  Sales Orders
                </span>
              </div>
            </div>
            <div className="text-sm text-right">
              <div>
                <span className="text-gray-600">Logged in as: </span>
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
          </div>
        </div>
      </nav>

      {/* MAIN */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Existing Sales Orders
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Confirm orders to reduce stock and trigger confirmation emails. Mark as
            out-of-stock if you cannot fulfill the order.
          </p>

          {loading ? (
            <p className="text-gray-500">Loading sales orders...</p>
          ) : loadError ? (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md text-sm">
              {loadError}
            </div>
          ) : orders.length === 0 ? (
            <p className="text-gray-500">
              No sales orders yet. Create one using the form below.
            </p>
          ) : (
            <div className="overflow-x-auto bg-white rounded-lg shadow">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 font-medium text-gray-700">ID</th>
                    <th className="px-4 py-2 font-medium text-gray-700">SO #</th>
                    <th className="px-4 py-2 font-medium text-gray-700">
                      Customer
                    </th>
                    <th className="px-4 py-2 font-medium text-gray-700">
                      Customer Email
                    </th>
                    <th className="px-4 py-2 font-medium text-gray-700">
                      Status
                    </th>
                    <th className="px-4 py-2 font-medium text-gray-700">
                      Created At
                    </th>
                    <th className="px-4 py-2 font-medium text-gray-700">
                      Confirmed At
                    </th>
                    <th className="px-4 py-2 font-medium text-gray-700">
                      Total
                    </th>
                    <th className="px-4 py-2 font-medium text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {orders.map((o) => {
                    const total = (o.items || []).reduce(
                      (sum, it) =>
                        sum + (it.quantity || 0) * (it.unitPrice || 0),
                      0
                    );

                    const isCancelled = o.status === 'CANCELLED';

                    return (
                      <tr key={o.id}>
                        <td className="px-4 py-2">{o.id}</td>
                        <td className="px-4 py-2 font-mono">{o.soNumber}</td>
                        <td className="px-4 py-2">{o.customerName}</td>
                        <td className="px-4 py-2">
                          {o.customerEmail || '-'}
                        </td>
                        <td className="px-4 py-2">
                          {renderStatusBadge(o.status)}
                        </td>
                        <td className="px-4 py-2">
                          {formatDateTime(o.createdAt)}
                        </td>
                        <td className="px-4 py-2">
                          {formatDateTime(o.confirmedAt)}
                        </td>
                        <td className="px-4 py-2">
                          {formatPrice(total)}
                        </td>
                        <td className="px-4 py-2">
                          <div className="flex flex-wrap gap-2">
                            {o.status === 'NEW' && (
                              <>
                                <button
                                  onClick={() => handleConfirm(o.id)}
                                  className="px-3 py-1 text-xs bg-green-600 text-white rounded-md hover:bg-green-700"
                                >
                                  Confirm
                                </button>
                                <button
                                  onClick={() => handleMarkOutOfStock(o.id)}
                                  className="px-3 py-1 text-xs bg-red-600 text-white rounded-md hover:bg-red-700"
                                >
                                  Out of Stock
                                </button>
                              </>
                            )}
                            {!isCancelled && (
                              <button
                                onClick={() => handleDownloadPickingSlip(o.id)}
                                className="px-3 py-1 text-xs bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                              >
                                Picking Slip
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* CREATE NEW SALES ORDER */}
        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Create New Sales Order
          </h2>

          {createError && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md mb-3 text-sm">
              {createError}
            </div>
          )}
          {createSuccess && (
            <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded-md mb-3 text-sm">
              {createSuccess}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleCreateOrder}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Customer Name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none"
                value={form.customerName}
                onChange={(e) =>
                  setForm({ ...form, customerName: e.target.value })
                }
                required
              />
              <input
                type="email"
                placeholder="Customer Email"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none"
                value={form.customerEmail}
                onChange={(e) =>
                  setForm({ ...form, customerEmail: e.target.value })
                }
                required
              />
            </div>

            <div>
              <h3 className="text-md font-semibold text-gray-800 mb-2">
                Items
              </h3>
              <div className="space-y-3">
                {form.items.map((item, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-1 md:grid-cols-4 gap-3 items-center"
                  >
                    {/* Product select */}
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={item.productId}
                      onChange={(e) =>
                        handleItemChange(index, 'productId', e.target.value)
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

                    {/* Quantity */}
                    <input
                      type="number"
                      min="1"
                      placeholder="Quantity"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={item.quantity}
                      onChange={(e) =>
                        handleItemChange(index, 'quantity', e.target.value)
                      }
                      required
                    />

                    {/* Unit price */}
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">$</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="Unit Price"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={item.unitPrice}
                        onChange={(e) =>
                          handleItemChange(index, 'unitPrice', e.target.value)
                        }
                        required
                      />
                    </div>

                    {/* Remove row */}
                    <button
                      type="button"
                      onClick={() => handleRemoveItemRow(index)}
                      className="px-3 py-2 text-xs bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={handleAddItemRow}
                className="mt-3 px-4 py-2 text-xs bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200"
              >
                + Add Item
              </button>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={creating}
                className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700 disabled:opacity-50"
              >
                {creating ? 'Creating...' : 'Create Sales Order'}
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}
