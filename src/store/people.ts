import { defineStore } from 'pinia'
import { Person } from '@/settings/person'

export const usePeopleStore = defineStore('people', {
    state: () => ({
        people: [] as Person[],
        selectedPeople: [] as Person[],
        markedImage: '' as string,
    }),
    actions: {
        setPeople(people: Person[]) {
            this.people = people;
        },
        setSelectedPeople(selectedPeople: Person[]) {
            this.selectedPeople = selectedPeople;
            // peopleからselectedPeopleを削除
            this.people = this.people.filter(person => !selectedPeople.includes(person));
        },
        updatePeople(people: Person[]) {
            // peopleをマージ
            this.people = this.people.concat(people);
        },
        setMarkedImage(markedImage: string) {
            this.markedImage = markedImage;
        }
    },
})