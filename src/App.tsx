import { Suspense } from 'react';
import { CanvasWrapper } from './components/CanvasWrapper';
import { CameraStuff } from './components/CameraStuff';
import { Loader } from './components/Loader';
import { Environment } from '@react-three/drei';
import { Corner } from './components/Corner';
// @ts-ignore
import { Bath } from './components/Bath';
// import { Perf } from 'r3f-perf';
// import { LinkedInIcon, PhoneIcon, EmailIcon } from './components/Icons';

const Scene = () => {
  return (
    <>
      <Suspense fallback={null}>
        <Bath />
        <Loader />

        <Environment
          files="drakensberg_solitary_mountain_1k.jpg"
          environmentIntensity={0.15}
        />
      </Suspense>

      <CameraStuff />
      {/* <Perf /> */}
    </>
  );
};

export default function App() {
  return (
    <div className="relative min-h-screen bg-[#e2dbc9]">
      <div className="h-screen p-4">
        <div className="relative h-full w-full rounded-[1.5rem] bg-[#918a7e]">
          <h1 className="absolute z-[2] w-[8em] pl-[0.5rem] text-[6.7em] font-normal leading-[0.87] tracking-[-0.05em] text-[#e2dbc9] max-md:text-[4em]">
            Green Baths
          </h1>

          <CanvasWrapper>
            <Scene />
          </CanvasWrapper>
        </div>
      </div>
    </div>
  );
}
