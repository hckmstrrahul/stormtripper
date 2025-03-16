import React, { Suspense } from 'react';
import { CanvasWrapper } from './components/CanvasWrapper';
import { CameraStuff } from './components/CameraStuff';
import { Loader } from './components/Loader';
// @ts-ignore
import { Bath } from './components/Bath';
// @ts-ignore
import { Lights } from './components/Lights';
import { Spinner } from './components/Spinner';

const Scene = () => {
  return (
    <>
      <Suspense fallback={null}>
        <Bath />

        <Lights />
        <CameraStuff />

        <Loader />
      </Suspense>
    </>
  );
};

export default function App() {
  return (
    <div className="relative min-h-[100dvh] bg-[#4e1c24]">
      <div className="h-[100dvh] p-4">
        <div className="relative h-full w-full rounded-[.9rem] bg-[#6d2932] max-md:pt-1">
          <h1 className="absolute z-[2] w-[10em] pl-[0.5rem] text-[6.7em] font-normal leading-[0.87] tracking-[-0.05em] text-[#e0e0e0] max-md:text-[4em]">
            Storm Tripper ⛈️🪩
          </h1>
          <div className="absolute z-[2] pl-[0.5rem] top-[7.5rem] max-md:top-[5rem] text-[#e0e0e0]" style={{ fontSize: "16px" }}>
            This is a Claude → Cursor prototype built using ThreeJS. Sources: <a href="https://github.com/seantai/greentub" className="underline hover:text-blue-300">Base template</a>, <a href="https://github.com/mrdoob/three.js/blob/master/examples/webgl_loader_collada_skinning.html" className="underline hover:text-blue-300">3D Model</a>.
          </div>

          <CanvasWrapper>
            <Scene />
          </CanvasWrapper>
        </div>
      </div>
      <Spinner />
    </div>
  );
}
