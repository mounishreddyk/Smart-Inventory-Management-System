import { useState, useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import {
  Search, Plus, Minus, Package, Edit2, Trash2,
  Tag, Box, IndianRupee, X, Bot, LogOut
} from 'lucide-react';
import {
  getProducts, addProduct, updateProduct,
  deleteProduct, searchProducts, getCategories,
  setAuthToken
} from './services/api';
import EnhancedDashboard from './components/EnhancedDashboard';
import CategoryManagement from './components/CategoryManagement';
import AIChat from './components/AIChat';
import AuthScreen from './components/AuthScreen';
import './App.css';

function App() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    quantity: 0,
    price: 0
  });

  const createNetworkErrorMessage = () => {
    return `Failed to load data. Check server connection.`;
  };

  const fetchProductsAndCategories = async () => {
    try {
      setLoading(true);
      const [prodData, catData] = await Promise.all([
        getProducts(),
        getCategories()
      ]);
      setProducts(prodData);
      setCategories(catData);
    } catch (error) {
      toast.error('Failed to load data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductsAndCategories();
  }, []);

  const handleSearch = async (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (value.trim() === '') {
      const data = await getProducts();
      setProducts(data);
      return;
    }

    const results = await searchProducts(value);
    setProducts(results);
  };

  const openForm = (product = null) => {
    if (product) {
      setEditingItem(product);
      setFormData({
        name: product.name,
        categoryId: product.category?.id || '',
        quantity: product.quantity,
        price: product.price
      });
    } else {
      setEditingItem(null);
      setFormData({ name: '', categoryId: '', quantity: 0, price: 0 });
    }
    setIsModalOpen(true);
  };

  const closeForm = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  // ✅ FIXED HANDLE SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        ...formData,
        categoryId: Number(formData.categoryId),
        quantity: Number(formData.quantity),
        price: Number(formData.price)
      };

      if (editingItem) {
        await updateProduct(editingItem.id, payload);
        toast.success('Product updated!');
      } else {
        await addProduct(payload);
        toast.success('Product added!');
      }

      closeForm();
      fetchProductsAndCategories();

    } catch (error) {
      console.error(error);
      toast.error('Operation failed.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this product?')) {
      await deleteProduct(id);
      fetchProductsAndCategories();
    }
  };

  const handleStockUpdate = async (product, delta) => {
    try {
      const newQuantity = product.quantity + delta;
      if (newQuantity < 0) return;
      
      const payload = {
        name: product.name,
        categoryId: product.category?.id,
        quantity: newQuantity,
        price: product.price
      };
      await updateProduct(product.id, payload);
      fetchProductsAndCategories();
    } catch (error) {
      toast.error('Failed to update stock');
    }
  };

  if (!isAuthenticated) {
    return (
      <>
        <Toaster />
        <AuthScreen onLoginSuccess={(userData) => {
          setIsAuthenticated(true);
          setCurrentUser(userData);
          if (userData && userData.token) {
            setAuthToken(userData.token);
            localStorage.setItem('token', userData.token);
          }
        }} />
      </>
    );
  }

  return (
    <div className="app-container">
      <Toaster />

      <header className="header">
        <h1>Inventory Hub</h1>

        <div className="controls">
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={handleSearch}
          />

          <button className="btn btn-secondary" onClick={() => setIsCategoryModalOpen(true)}>
            <Tag size={18} /> Categories
          </button>

          <button className="btn btn-primary" onClick={() => openForm()}>
            <Plus size={18} /> Add Product
          </button>

          <button className="btn btn-ghost" onClick={() => {
            setIsAuthenticated(false);
            setCurrentUser(null);
            setAuthToken(null);
            localStorage.removeItem('token');
          }}>
            <LogOut size={18} /> Logout
          </button>
        </div>
      </header>

      <EnhancedDashboard />

      {isCategoryModalOpen && (
        <CategoryManagement onClose={() => {
          setIsCategoryModalOpen(false);
          fetchProductsAndCategories(); // refresh data so dropdown gets new categories
        }} />
      )}

      <main className="products-wrapper">
        {loading ? (
          <p>Loading...</p>
        ) : products.length === 0 ? (
          <div className="empty-state">
            <Package size={48} />
            <p>No products found in inventory</p>
          </div>
        ) : (
          <div className="product-grid">
            {products.map(product => (
              <div key={product.id} className="product-card">
                <div className="card-body">
                  <h3 className="card-title">{product.name}</h3>
                  <div className="card-stat">
                    <span className="stat-label"><Package size={16} /> Stock</span>
                    <div className="stock-controls">
                      <button 
                        className="icon-btn" 
                        onClick={() => handleStockUpdate(product, -1)}
                        disabled={product.quantity <= 0}
                      >
                        <Minus size={16} />
                      </button>
                      <span className="stat-value stock-value">{product.quantity}</span>
                      <button 
                        className="icon-btn" 
                        onClick={() => handleStockUpdate(product, 1)}
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="card-stat">
                    <span className="stat-label"><IndianRupee size={16} /> Price</span>
                    <span className="stat-value price">₹ {product.price}</span>
                  </div>
                </div>

                <div className="card-actions">
                  <button className="btn btn-secondary" onClick={() => openForm(product)}>
                    <Edit2 size={16} /> Edit
                  </button>
                  <button className="btn btn-danger" onClick={() => handleDelete(product.id)}>
                    <Trash2 size={16} /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal glass-panel">
            <button className="btn-close" onClick={closeForm}><X size={20} /></button>
            <h2 style={{ marginBottom: '1.5rem' }}>{editingItem ? 'Edit Product' : 'Add Product'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Name</label>
                <input
                  className="form-control"
                  placeholder="Product Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Category</label>
                <select
                  className="form-control"
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Quantity</label>
                <input
                  className="form-control"
                  type="number"
                  placeholder="Quantity"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                  min="0"
                  required
                />
              </div>

              <div className="form-group">
                <label>Price</label>
                <input
                  className="form-control"
                  type="number"
                  placeholder="Price"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-ghost" onClick={closeForm}>Cancel</button>
                <button type="submit" className="btn btn-primary">
                  {editingItem ? 'Update' : 'Add'} Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;