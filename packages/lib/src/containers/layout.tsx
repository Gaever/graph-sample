import Box from "@mui/material/Box";
import GraphCanvas from "../components/graph-canvas";
import { ElementRect } from "../types";

export interface LayoutProps {
  rect: ElementRect;
  children: JSX.Element;
}

function Layout(props: LayoutProps) {
  return (
    <Box
      sx={{
        height: "100%",
        width: "100%",
        position: "relative",
        "&>div:first-of-type>div": {
          // разрешает конфликт глубины с отображением сетки
          zIndex: "1 !important",
        },
      }}
    >
      <GraphCanvas rect={props.rect} />
      {props.children}
    </Box>
  );
}

export default Layout;
