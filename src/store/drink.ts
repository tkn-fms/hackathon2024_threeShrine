import { defineStore } from 'pinia'

export const useDrinkStore = defineStore('drink', {
  state: () => ({
    drink: [] as string[],
  }),
  actions: {
    setDrink(drinkList: string[]) {
      this.drink = drinkList;
    },
  },
})