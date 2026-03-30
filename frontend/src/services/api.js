import axios from 'axios';

const api = axios.create({
    baseURL: "https://my-project-jfs-production.up.railway.app/api",
    headers: {
        'Content-Type': 'application/json',
    },
});

// ================= PRODUCTS =================
export const getProducts = async () => {
    const res = await api.get('/products');
    return res.data;
};

export const addProduct = async (data) => {
    const res = await api.post('/products', data);
    return res.data;
};

export const updateProduct = async (id, data) => {
    const res = await api.put(`/products/${id}`, data);
    return res.data;
};

export const deleteProduct = async (id) => {
    const res = await api.delete(`/products/${id}`);
    return res.data;
};

export const searchProducts = async (name) => {
    const res = await api.get(`/products/search?name=${name}`);
    return res.data;
};

// ================= CATEGORIES =================
export const getCategories = async () => {
    const res = await api.get('/categories');
    return res.data;
};

export const createCategory = async (name) => {
    const res = await api.post('/categories', { name });
    return res.data;
};

export const deleteCategory = async (id) => {
    const res = await api.delete(`/categories/${id}`);
    return res.data;
};

// ================= AUTH =================
export const loginUser = async (username, password) => {
    const res = await api.post('/auth/login', { username, password });
    return res.data;
};

export const registerUser = async (username, password) => {
    const res = await api.post('/auth/register', { username, password });
    return res.data;
};

// ================= DASHBOARD =================
export const getDashboardAnalytics = async () => {
    const res = await api.get('/dashboard');
    return res.data;
};

// ================= AI =================
export const queryAI = async (query) => {
    const res = await api.post('/ai/query', query, {
        headers: { 'Content-Type': 'text/plain' }
    });
    return res.data;
};