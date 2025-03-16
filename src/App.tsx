import { Suspense } from 'react';
import { CanvasWrapper } from './components/CanvasWrapper';
import { CameraStuff } from './components/CameraStuff';
import { Loader } from './components/Loader';
// @ts-ignore
import { Bath } from './components/Bath';
// @ts-ignore
import { Lights } from './components/Lights';
import { Leva } from 'leva';

const Scene = () => {
  return (
    <>
      <Suspense fallback={null}>
        <Bath />
        <Loader />

        <Lights />
        <CameraStuff />
      </Suspense>
    </>
  );
};

export default function App() {
  return (
    <div className="relative min-h-[100dvh] bg-[#e2dbc9]">
      <div className="h-[100dvh] p-4">
        <div className="relative h-full w-full rounded-[.9rem] bg-[#918a7e] max-md:pt-1">
          <h1 className="absolute z-[2] w-[8em] pl-[0.5rem] text-[6.7em] font-normal leading-[0.87] tracking-[-0.05em] text-[#e2dbc9] max-md:text-[4em]">
            Green Baths
          </h1>

          <CanvasWrapper>
            <Scene />
          </CanvasWrapper>
          <Leva hidden={!import.meta.env.DEV} />
        </div>
      </div>
    </div>
  );
}
