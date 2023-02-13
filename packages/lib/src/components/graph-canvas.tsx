import { appStateCtx } from "../data-layer/app-state-provider";
import { ElementRect } from "../types";
import Box from "@mui/material/Box";
import { useContext } from "react";

export interface GraphCanvasProps {
  rect: ElementRect;
}

export default function GraphCanvas(props: GraphCanvasProps) {
  const { cyContainerRef } = useContext(appStateCtx);

  return <Box ref={cyContainerRef} sx={{ width: props.rect.width, height: props.rect.height }} />;
}
