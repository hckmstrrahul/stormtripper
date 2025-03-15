import { create } from 'zustand';

type SceneLoadedStore = {
  isSceneLoaded: boolean;
  setSceneLoaded: (loaded: boolean) => void;
};

export const useSceneLoadedStore = create<SceneLoadedStore>((set) => ({
  isSceneLoaded: false,
  setSceneLoaded: (loaded) => set({ isSceneLoaded: loaded })
}));
