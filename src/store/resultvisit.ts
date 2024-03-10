import{defineStore} from 'pinia'

export const useVisitCounterStore=defineStore('counter',{
    state:()=>({
        visits:0,
    }),
    actions:{
        increment(){
            this.visits++
        },
        reset(){
            this.visits=0
        }
    }
})
