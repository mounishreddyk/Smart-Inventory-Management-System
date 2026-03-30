import { useState, useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import {
  Search, Plus, Package, Edit2, Trash2,
  Tag, Box, IndianRupee, X, Bot, LogOut
} from 'lucide-react';
import {
  getProducts, addProduct, updateProduct,
  deleteProduct, searchProducts, getCategories
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

  if (!isAuthenticated) {
    return (
      <>
        <Toaster />
        <AuthScreen onLoginSuccess={(userData) => {
          setIsAuthenticated(true);
          setCurrentUser(userData);
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

          <button onClick={() => openForm()}>
            <Plus /> Add
          </button>

          <button onClick={() => {
            setIsAuthenticated(false);
            setCurrentUser(null);
          }}>
            <LogOut /> Logout
          </button>
        </div>
      </header>

      <EnhancedDashboard />

      <main>
        {loading ? (
          <p>Loading...</p>
        ) : products.length === 0 ? (
          <p>No products</p>
        ) : (
          products.map(product => (
            <div key={product.id}>
              <h3>{product.name}</h3>
              <p>{product.quantity}</p>
              <p>₹ {product.price}</p>

              <button onClick={() => openForm(product)}>
                <Edit2 /> Edit
              </button>

              <button onClick={() => handleDelete(product.id)}>
                <Trash2 /> Delete
              </button>
            </div>
          ))
        )}
      </main>

      {/* SIMPLE FORM MODAL (IMPORTANT) */}
      {isModalOpen && (
        <div className="modal">
          <form onSubmit={handleSubmit}>
            <input
              placeholder="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />

            <select
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
            >
              <option value="">Select Category</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>

            <input
              type="number"
              placeholder="Quantity"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
            />

            <input
              type="number"
              placeholder="Price"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
            />

            <button type="submit">Submit</button>
            <button type="button" onClick={closeForm}>Cancel</button>
          </form>
        </div>
      )}
    </div>
  );
}

export default App;