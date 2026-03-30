import axios from 'axios';

// ✅ YOUR BACKEND URL
const BASE_URL = "https://my-project-jfs-production.up.railway.app";

// Create Axios instance
const api = axios.create({
    baseURL: "https://my-project-jfs-production.up.railway.app/api",
    headers: {
        'Content-Type': 'application/json',
    },
});

// --- Product API ---
export const getProducts = async () => {
    const response = await api.get('/api/products');
    return response.data;
};

export const getProductById = async (id) => {
    const response = await api.get(`/api/products/${id}`);
    return response.data;
};

export const addProduct = async (productData) => {
    const response = await api.post('/api/products', productData);
    return response.data;
};

export const updateProduct = async (id, productData) => {
    const response = await api.put(`/api/products/${id}`, productData);
    return response.data;
};

export const deleteProduct = async (id) => {
    const response = await api.delete(`/api/products/${id}`);
    return response.data;
};

export const searchProducts = async (name) => {
    const response = await api.get('/api/products/search', { params: { name } });
    return response.data;
};

// --- Category API ---
export const getCategories = async () => {
    const response = await api.get('/api/categories');
    return response.data;
};

export const createCategory = async (name) => {
    const response = await api.post('/api/categories', { name });
    return response.data;
};

export const deleteCategory = async (id) => {
    const response = await api.delete(`/api/categories/${id}`);
    return response.data;
};

// --- Dashboard API ---
export const getDashboardAnalytics = async () => {
    const response = await api.get('/api/dashboard');
    return response.data;
};

// --- AI API ---
export const queryAI = async (query) => {
    const response = await api.post('/api/ai/query', query, {
        headers: { 'Content-Type': 'text/plain' }
    });
    return response.data;
};

// --- Auth API ---
export const loginUser = async (username, password) => {
    const response = await api.post('/api/auth/login', { username, password });
    return response.data;
};

export const registerUser = async (username, password) => {
    const response = await api.post('/api/auth/register', { username, password });
    return response.data;
};