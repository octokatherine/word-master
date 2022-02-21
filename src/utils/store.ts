import create from 'zustand';

type State = {
    user: any,
    isLoading: boolean,
    setIsLoading: any,
}

const useStore = create<State>((set) => ({
    user: null,
    isLoading: true,
    setIsLoading: (isLoading: boolean) => set({ isLoading }),
    setUser: (user: any) => set({ user }),
}));

export default useStore;