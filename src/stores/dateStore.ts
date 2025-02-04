import { defineStore } from 'pinia';

export const useDateStore = defineStore('dateStore', {
  state: () => ({
    startDate: '2024-12-01',
    endDate: '2025-01-01',
  }),
  actions: {
    setDates(startDate: string, endDate: string) {
      this.startDate = startDate;
      this.endDate = endDate;
    },
  },
  getters: {
    daysDifference: (state) => {
      const start = new Date(state.startDate);
      const end = new Date(state.endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    },
  },
});