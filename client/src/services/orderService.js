import api from '../api/axiosConfig';

export const OrderService = {
    getStats: async () => {
        return await api.get('/orders/admin/stats');
    },

    create: async (customerName) => {
        return await api.post('/orders', { 
            customerName: customerName || "Guest" 
        });
    },

    getOrderDetails: async (id) => {
        return await api.get(`/orders/${id}`);
    }
};