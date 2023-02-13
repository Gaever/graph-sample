import { fullscreenEventListenerEvents } from "../utils";
import MUIPopover, { PopoverProps } from "@mui/material/Popover";
import { forwardRef, useEffect } from "react";

export type { PopoverProps };

export const Popover = forwardRef<any, PopoverProps>((props, ref) => {
  useEffect(() => {
    const fullscreenListener = () => {
      props?.onClose?.({}, "escapeKeyDown");
    };
    fullscreenEventListenerEvents.forEach((eventName) => {
      document.addEventListener(eventName, fullscreenListener);
    });

    return () => {
      fullscreenEventListenerEvents.forEach((eventName) => {
        document.removeEventListener(eventName, fullscreenListener);
      });
    };
  }, []);

  return <MUIPopover {...props} ref={ref} />;
});
