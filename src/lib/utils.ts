import { useEffect, useState } from 'react';

export function useResponsiveScale(
  baseWidth = 1300,
  minScale = 0.5,
  maxScale = 1.2
) {
  const [size, setSize] = useState([window.innerWidth, window.innerHeight]);

  useEffect(() => {
    function updateSize() {
      setSize([window.innerWidth, window.innerHeight]);
    }

    let timeoutId: ReturnType<typeof setTimeout>;
    function handleResize() {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(updateSize, 50);
    }

    window.addEventListener('resize', handleResize);
    updateSize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const scale = Math.min(Math.max(size[0] / baseWidth, minScale), maxScale);

  return { scale };
}

export const usePreventEventsOnElements = (
  eventTypes: string[],
  elementIds: string[]
) => {
  useEffect(() => {
    const elements = elementIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (elements.length === 0) return;

    const preventEvent = (e: Event) => {
      e.stopPropagation();
    };

    const addedListeners: { element: HTMLElement; eventType: string }[] = [];

    elements.forEach((element) => {
      eventTypes.forEach((eventType) => {
        element.addEventListener(eventType, preventEvent, { capture: true });
        addedListeners.push({ element, eventType });
      });
    });

    return () => {
      addedListeners.forEach(({ element, eventType }) => {
        element.removeEventListener(eventType, preventEvent, {
          capture: true
        });
      });
    };
  }, [elementIds, eventTypes]);
};
