import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function Dashboard() {
  const { user, logout } = useAuth();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  // Product CRUD form
  const [form, setForm] = useState({
    id: null,
    name: '',
    sku: '',
    stockQuantity: 0,
    price: 0,
  });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const isAdmin = user?.role === 'ADMIN';

  const formatPrice = (value) => {
    if (value == null || isNaN(value)) return '$0.00';
    return `$${Number(value).toFixed(2)}`;
  };

  // Inventory summary stats
  const lowStockThreshold = 5;
  const totalProducts = products.length;
  const totalStock = products.reduce((sum, p) => sum + (p.stockQuantity || 0), 0);
  const lowStockCount = products.filter((p) => (p.stockQuantity || 0) < lowStockThreshold).length;
  const totalInventoryValue = products.reduce(
    (sum, p) => sum + (p.stockQuantity || 0) * (p.price || 0),
    0
  );

  // ------------ LOAD PRODUCTS ------------

  const loadProducts = async () => {
    if (!isAdmin) {
      setLoadError('You are not allowed to view products (ADMIN only).');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await axios.get('/api/products');
      setProducts(res.data);
      setLoadError('');
    } catch (err) {
      if (err.response?.status === 403) {
        setLoadError('You are not allowed to view products (ADMIN only).');
      } else if (err.response?.status === 401) {
        setLoadError('Unauthorized. Please log in again.');
      } else {
        setLoadError('Failed to load products (check token / server).');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  const resetForm = () => {
    setForm({
      id: null,
      name: '',
      sku: '',
      stockQuantity: 0,
      price: 0,
    });
    setSaveError('');
    setSuccessMessage('');
  };

  // ------------ PRODUCT CREATE / UPDATE ------------

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveError('');
    setSuccessMessage('');

    const payload = {
      name: form.name,
      sku: form.sku,
      stockQuantity: Number(form.stockQuantity) || 0,
      price: Number(form.price) || 0,
    };

    try {
      let res;
      if (form.id == null) {
        // CREATE
        res = await axios.post('/api/products', payload);
        setProducts((prev) => [...prev, res.data]);
        setSuccessMessage('Product created successfully.');
      } else {
        // UPDATE
        res = await axios.put(`/api/products/${form.id}`, {
          ...payload,
          id: form.id,
        });
        setProducts((prev) =>
          prev.map((p) => (p.id === form.id ? res.data : p))
        );
        setSuccessMessage('Product updated successfully.');
      }
      resetForm();
    } catch (err) {
      const msg = err.response?.data || 'Failed to save product.';
      setSaveError(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (product) => {
    setForm({
      id: product.id,
      name: product.name,
      sku: product.sku,
      stockQuantity: product.stockQuantity,
      price: product.price ?? 0,
    });
    setSaveError('');
    setSuccessMessage('');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      await axios.delete(`/api/products/${id}`);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      alert(err.response?.data || 'Failed to delete product.');
    }
  };

  // ------------ STOCK ADJUSTMENT (IN/OUT) ------------

  const [selectedProductId, setSelectedProductId] = useState('');
  const [movementType, setMovementType] = useState('IN'); // IN or OUT
  const [movementQuantity, setMovementQuantity] = useState('');
  const [movementReason, setMovementReason] = useState('');
  const [movementSaving, setMovementSaving] = useState(false);
  const [movementError, setMovementError] = useState('');
  const [movementSuccess, setMovementSuccess] = useState('');

  const [movementHistory, setMovementHistory] = useState([]);
  const [movementHistoryLoading, setMovementHistoryLoading] = useState(false);
  const [movementHistoryError, setMovementHistoryError] = useState('');

  const loadMovementHistory = async (productId) => {
    if (!productId) {
      setMovementHistory([]);
      return;
    }
    try {
      setMovementHistoryLoading(true);
      setMovementHistoryError('');
      const res = await axios.get(`/api/stock-movements/product/${productId}`);
      setMovementHistory(res.data);
    } catch (err) {
      setMovementHistoryError('Failed to load stock movement history.');
    } finally {
      setMovementHistoryLoading(false);
    }
  };

  // When selected product changes, load its movement history
  useEffect(() => {
    if (selectedProductId) {
      loadMovementHistory(selectedProductId);
    } else {
      setMovementHistory([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProductId]);

  const handleStockAdjust = async (e) => {
    e.preventDefault();
    setMovementSaving(true);
    setMovementError('');
    setMovementSuccess('');

    if (!selectedProductId) {
      setMovementError('Please select a product.');
      setMovementSaving(false);
      return;
    }
    const qty = Number(movementQuantity);
    if (!qty || qty <= 0) {
      setMovementError('Quantity must be greater than 0.');
      setMovementSaving(false);
      return;
    }

    try {
      const endpoint = movementType === 'IN'
        ? '/api/stock-movements/in'
        : '/api/stock-movements/out';

      const res = await axios.post(endpoint, null, {
        params: {
          productId: selectedProductId,
          quantity: qty,
          reason: movementReason || undefined,
        },
      });

      setMovementSuccess(
        `Stock ${movementType === 'IN' ? 'increased' : 'decreased'} by ${qty} units.`
      );
      setMovementQuantity('');
      setMovementReason('');

      // Reload products to update stockQuantity in UI
      await loadProducts();
      // Reload movement history for this product
      await loadMovementHistory(selectedProductId);

    } catch (err) {
      const msg = err.response?.data || 'Failed to adjust stock.';
      setMovementError(msg);
    } finally {
      setMovementSaving(false);
    }
  };

  const formatDateTime = (iso) => {
    if (!iso) return '';
    return new Date(iso).toLocaleString();
  };

  // ------------ RENDER ------------

  return (
    <div className="min-h-screen bg-gray-50">
      {/* NAVBAR */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-2xl font-bold text-gray-800">WMS Dashboard</h1>
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

      {/* MAIN CONTENT */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* SECTION TITLE */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">
            Product &amp; Inventory Management
          </h2>
          <p className="text-sm text-gray-600">
            Manage products, track inventory levels, adjust stock manually, and view stock movement history.
          </p>
        </div>

        {/* ADMIN ONLY NOTICE */}
        {!isAdmin && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
            This section is accessible only to <strong>ADMIN</strong> users.
          </div>
        )}

        {/* INVENTORY SUMMARY CARDS */}
        {isAdmin && !loading && !loadError && (
          <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white shadow rounded-lg p-4 border-l-4 border-blue-500">
              <p className="text-xs uppercase text-gray-500">Total Products</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">
                {totalProducts}
              </p>
            </div>
            <div className="bg-white shadow rounded-lg p-4 border-l-4 border-green-500">
              <p className="text-xs uppercase text-gray-500">Total Stock Units</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">
                {totalStock}
              </p>
            </div>
            <div className="bg-white shadow rounded-lg p-4 border-l-4 border-yellow-500">
              <p className="text-xs uppercase text-gray-500">
                Low Stock (&lt; {lowStockThreshold})
              </p>
              <p className="text-2xl font-bold text-gray-800 mt-1">
                {lowStockCount}
              </p>
            </div>
            <div className="bg-white shadow rounded-lg p-4 border-l-4 border-purple-500">
              <p className="text-xs uppercase text-gray-500">Inventory Value (USD)</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">
                {formatPrice(totalInventoryValue)}
              </p>
            </div>
          </section>
        )}

        {/* PRODUCTS TABLE */}
        <section className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Products List
          </h3>

          {loading ? (
            <p className="text-gray-500">Loading products...</p>
          ) : loadError ? (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
              {loadError}
            </div>
          ) : products.length === 0 ? (
            <p className="text-gray-500">
              No products found. Add your first one below.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 font-medium text-gray-700">ID</th>
                    <th className="px-4 py-2 font-medium text-gray-700">Name</th>
                    <th className="px-4 py-2 font-medium text-gray-700">SKU</th>
                    <th className="px-4 py-2 font-medium text-gray-700">Stock</th>
                    <th className="px-4 py-2 font-medium text-gray-700">Price</th>
                    <th className="px-4 py-2 font-medium text-gray-700">Status</th>
                    <th className="px-4 py-2 font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {products.map((p) => {
                    const isLowStock = (p.stockQuantity || 0) < lowStockThreshold;
                    return (
                      <tr key={p.id} className={isLowStock ? 'bg-yellow-50' : ''}>
                        <td className="px-4 py-2">{p.id}</td>
                        <td className="px-4 py-2">{p.name}</td>
                        <td className="px-4 py-2 font-mono">{p.sku}</td>
                        <td className="px-4 py-2">{p.stockQuantity}</td>
                        <td className="px-4 py-2">
                          {formatPrice(p.price)}
                        </td>
                        <td className="px-4 py-2">
                          {isLowStock ? (
                            <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-800">
                              Low Stock
                            </span>
                          ) : (
                            <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">
                              OK
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-2 space-x-2">
                          <button
                            onClick={() => handleEdit(p)}
                            className="px-3 py-1 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            disabled={!isAdmin}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(p.id)}
                            className="px-3 py-1 text-xs bg-red-600 text-white rounded-md hover:bg-red-700"
                            disabled={!isAdmin}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* CREATE / EDIT PRODUCT FORM */}
        {isAdmin && (
          <section className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              {form.id == null ? 'Add New Product' : `Edit Product #${form.id}`}
            </h3>

            {saveError && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md mb-3 text-sm">
                {saveError}
              </div>
            )}
            {successMessage && (
              <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded-md mb-3 text-sm">
                {successMessage}
              </div>
            )}

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <input
                  type="text"
                  placeholder="Product Name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
                <input
                  type="text"
                  placeholder="SKU (unique)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                  value={form.sku}
                  onChange={(e) => setForm({ ...form, sku: e.target.value })}
                  required
                />
                <input
                  type="number"
                  min="0"
                  placeholder="Stock Quantity"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                  value={form.stockQuantity}
                  onChange={(e) =>
                    setForm({ ...form, stockQuantity: e.target.value })
                  }
                  required
                />
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">$</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Price (USD)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                    value={form.price}
                    onChange={(e) =>
                      setForm({ ...form, price: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving
                    ? 'Saving...'
                    : form.id == null
                    ? 'Create Product'
                    : 'Update Product'}
                </button>
                {form.id != null && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 bg-gray-200 text-gray-800 text-sm rounded-md hover:bg-gray-300"
                  >
                    Cancel Edit
                  </button>
                )}
              </div>
            </form>
          </section>
        )}

        {/* MANUAL STOCK ADJUSTMENT + HISTORY */}
        {isAdmin && (
          <section className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Manual Stock In/Out &amp; Movement History
            </h3>

            {products.length === 0 ? (
              <p className="text-gray-500">
                No products available. Please add a product first.
              </p>
            ) : (
              <>
                {/* ADJUSTMENT FORM */}
                <form className="space-y-4 mb-6" onSubmit={handleStockAdjust}>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Product Select */}
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={selectedProductId}
                      onChange={(e) => setSelectedProductId(e.target.value)}
                      required
                    >
                      <option value="">Select Product</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.sku})
                        </option>
                      ))}
                    </select>

                    {/* Movement Type */}
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={movementType}
                      onChange={(e) => setMovementType(e.target.value)}
                    >
                      <option value="IN">Stock IN (+)</option>
                      <option value="OUT">Stock OUT (-)</option>
                    </select>

                    {/* Quantity */}
                    <input
                      type="number"
                      min="1"
                      placeholder="Quantity"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={movementQuantity}
                      onChange={(e) => setMovementQuantity(e.target.value)}
                      required
                    />

                    {/* Reason */}
                    <input
                      type="text"
                      placeholder="Reason (optional)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={movementReason}
                      onChange={(e) => setMovementReason(e.target.value)}
                    />
                  </div>

                  {movementError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md text-sm">
                      {movementError}
                    </div>
                  )}
                  {movementSuccess && (
                    <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded-md text-sm">
                      {movementSuccess}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={movementSaving}
                    className="mt-2 px-4 py-2 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {movementSaving ? 'Applying...' : 'Apply Stock Movement'}
                  </button>
                </form>

                {/* MOVEMENT HISTORY TABLE */}
                <div>
                  <h4 className="text-md font-semibold text-gray-800 mb-2">
                    Movement History {selectedProductId && `(Product ID: ${selectedProductId})`}
                  </h4>

                  {movementHistoryLoading ? (
                    <p className="text-gray-500">Loading history...</p>
                  ) : movementHistoryError ? (
                    <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md text-sm">
                      {movementHistoryError}
                    </div>
                  ) : !selectedProductId ? (
                    <p className="text-gray-500 text-sm">
                      Select a product above to view its stock movement history.
                    </p>
                  ) : movementHistory.length === 0 ? (
                    <p className="text-gray-500 text-sm">
                      No stock movements recorded yet for this product.
                    </p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 font-medium text-gray-700">ID</th>
                            <th className="px-4 py-2 font-medium text-gray-700">Type</th>
                            <th className="px-4 py-2 font-medium text-gray-700">Quantity</th>
                            <th className="px-4 py-2 font-medium text-gray-700">Reason</th>
                            <th className="px-4 py-2 font-medium text-gray-700">Date &amp; Time</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                          {movementHistory.map((m) => (
                            <tr key={m.id}>
                              <td className="px-4 py-2">{m.id}</td>
                              <td className="px-4 py-2">
                                {m.type === 'IN' ? (
                                  <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">
                                    IN (+)
                                  </span>
                                ) : (
                                  <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-800">
                                    OUT (-)
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-2">{m.quantity}</td>
                              <td className="px-4 py-2">{m.reason || '-'}</td>
                              <td className="px-4 py-2">{formatDateTime(m.createdAt)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
