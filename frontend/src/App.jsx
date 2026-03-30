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

  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    quantity: 0,
    price: 0.0
  });

  // -------- FIXED ERROR MESSAGE --------
  const isSafari = () => {
    if (typeof navigator === 'undefined') return false;
    return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  };

  const createNetworkErrorMessage = () => {
    const safariNote = isSafari()
      ? ' (Check browser network permissions.)'
      : '';
    return `Failed to load data. Please check server connection.${safariNote}`;
  };
  // ------------------------------------

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
      const message = error?.message?.includes('Network Error')
        ? createNetworkErrorMessage()
        : 'Failed to load data.';
      toast.error(message);
      console.error(error);
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

    try {
      const results = await searchProducts(value);
      setProducts(results);
    } catch (error) {
      console.error(error);
    }
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await updateProduct(editingItem.id, formData);
        toast.success('Product updated!');
      } else {
        await addProduct(formData);
        toast.success('Product added!');
      }
      closeForm();
      const updatedProducts = await getProducts();
      setProducts(updatedProducts);
    } catch (error) {
      if (error.response?.data) {
        Object.values(error.response.data).forEach(msg => toast.error(msg));
      } else if (error.message?.includes('Network Error')) {
        toast.error(createNetworkErrorMessage());
      } else {
        toast.error('Operation failed.');
      }
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this product?')) {
      try {
        await deleteProduct(id);
        toast.success('Deleted.');
        const updatedProducts = await getProducts();
        setProducts(updatedProducts);
      } catch (error) {
        toast.error('Delete failed.');
        console.error(error);
      }
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
    </div>
  );
}

export default App;