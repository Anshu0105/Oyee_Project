import { create } from 'zustand';
import api from '../api/adminApi';

export const useAdminStore = create((set, get) => ({
  overview: null,
  users: [],
  messages: [],
  flaggedMessages: [],
  leaderboard: [],
  storeItems: [],
  auraLog: [],
  broadcasts: [],
  settings: {},
  liveActivity: [],
  loading: false,

  fetchOverview: async () => {
    try {
      const { data } = await api.get('/analytics/overview');
      set({ overview: data });
    } catch (e) { console.error(e); }
  },

  fetchUsers: async (params = {}) => {
    set({ loading: true });
    try {
      const { data } = await api.get('/users', { params });
      set({ users: data.users, loading: false });
      return data;
    } catch (e) { set({ loading: false }); console.error(e); }
  },

  banUser: async (userId, reason) => {
    await api.post(`/users/${userId}/ban`, { reason });
    get().fetchUsers();
  },

  unbanUser: async (userId) => {
    await api.post(`/users/${userId}/unban`);
    get().fetchUsers();
  },

  adjustAura: async (userId, change, reason) => {
    const { data } = await api.post('/users/adjust-aura', { userId, change, reason });
    return data;
  },

  fetchFlagged: async () => {
    try {
      const { data } = await api.get('/moderation/flagged');
      set({ flaggedMessages: data });
    } catch (e) { console.error(e); }
  },

  approveMessage: async (msgId) => {
    await api.post(`/moderation/${msgId}/approve`);
    get().fetchFlagged();
  },

  removeMessage: async (msgId) => {
    await api.post(`/moderation/${msgId}/remove`);
    get().fetchFlagged();
  },

  removeBanUser: async (msgId) => {
    await api.post(`/moderation/${msgId}/remove-and-ban`);
    get().fetchFlagged();
  },

  fetchLeaderboard: async () => {
    try {
      const { data } = await api.get('/leaderboard');
      set({ leaderboard: data });
    } catch (e) { console.error(e); }
  },

  fetchStoreItems: async () => {
    try {
      const { data } = await api.get('/store/items');
      set({ storeItems: data });
    } catch (e) { console.error(e); }
  },

  fetchAuraLog: async (params = {}) => {
    try {
      const { data } = await api.get('/aura-log', { params });
      set({ auraLog: data.logs });
    } catch (e) { console.error(e); }
  },

  sendBroadcast: async (payload) => {
    await api.post('/broadcast', payload);
    get().fetchBroadcasts();
  },

  fetchBroadcasts: async () => {
    try {
      const { data } = await api.get('/broadcast');
      set({ broadcasts: data });
    } catch (e) { console.error(e); }
  },

  pushActivity: (event) => {
    set(s => ({ liveActivity: [event, ...s.liveActivity].slice(0, 50) }));
  }
}));
