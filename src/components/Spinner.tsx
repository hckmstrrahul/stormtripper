import { useSceneLoadedStore } from '../store';

export const Spinner = () => {
  const { isSceneLoaded } = useSceneLoadedStore();

  return (
    <>
      {!isSceneLoaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="z-[10000] h-8 w-8 animate-spin rounded-full border-4 border-[#e2dbc9] border-t-transparent" />
        </div>
      )}
    </>
  );
};
