import { ElementRect } from "../types";
import { documentFullscreenElement, fullscreenEventListenerEvents } from "../utils";
import { useEffect, useState } from "react";

export function useResizeObserver(element: Element | null) {
  const [rect, setRect] = useState<ElementRect>({ width: 0, height: 0 });
  const [elementHeightTrigger, setElementHeightTrigger] = useState(false);

  useEffect(() => {
    if (element) {
      const resizeObserver = new ResizeObserver(function (entries) {
        const rect = entries[0].contentRect;

        const width = rect.width;
        const height = rect.height;

        setRect({ width, height });
      });
      resizeObserver.observe(element);

      const fullscreenListener = () => {
        if (!documentFullscreenElement()) {
          // При выходе из полноэкранного режима
          // граф вылезает за пределы livewire компонента.
          // Лечится грязным хаком ниже.

          // @ts-expect-error
          element.style.height = "0%";
          setElementHeightTrigger(true);
        }
      };

      fullscreenEventListenerEvents.forEach((eventName) => {
        document.addEventListener(eventName, fullscreenListener);
      });

      return () => {
        resizeObserver.unobserve(element);
        fullscreenEventListenerEvents.forEach((eventName) => {
          document.removeEventListener(eventName, fullscreenListener);
        });
      };
    }
  }, [element]);

  useEffect(() => {
    if (elementHeightTrigger) {
      setTimeout(() => {
        // @ts-expect-error
        element.style.height = "100%";
        setElementHeightTrigger(false);
      }, 100);
    }
  }, [element, elementHeightTrigger]);

  return rect;
}
