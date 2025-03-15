import { useEffect } from 'react';
import { useSceneLoadedStore } from '../store';

export const Loader = () => {
  const { setSceneLoaded } = useSceneLoadedStore();

  useEffect(() => {
    setSceneLoaded(true);
  }, [setSceneLoaded]);

  return null;
};
