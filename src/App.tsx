import { Suspense } from 'react';
import { CanvasWrapper } from './components/CanvasWrapper';
import { CameraStuff } from './components/CameraStuff';
import { Loader } from './components/Loader';
import { Knot } from './components/Knot';
// import { Perf } from 'r3f-perf';

const Scene = () => {
  return (
    <>
      <Suspense fallback={null}>
        <Knot />
        <Loader />
      </Suspense>

      <CameraStuff />
      {/* <Perf /> */}
    </>
  );
};

export default function App() {
  return (
    <div className="relative min-h-screen font-inter">
      <CanvasWrapper>
        <Scene />
      </CanvasWrapper>
    </div>
  );
}
