import { defineStore } from 'pinia'

export const useUUIDStore = defineStore('uuid', {
  state: () => ({
    uuid: "" as string,
  }),
  actions: {
    setUUID(uuid: string) {
      this.uuid = uuid;
    },
  },
})