import * as styles from "@mui/material/styles";

declare module "@mui/material/styles" {
  interface Palette {
    custom: {
      compoundNode: React.CSSProperties["color"];
      compoundSelected: React.CSSProperties["color"];
      nodeSelected: React.CSSProperties["color"];
      edgeSelected: React.CSSProperties["color"];
    };
  }

  interface PaletteOptions {
    custom: {
      compoundNode: React.CSSProperties["color"];
      compoundSelected: React.CSSProperties["color"];
      nodeSelected: React.CSSProperties["color"];
      edgeSelected: React.CSSProperties["color"];
    };
  }
}
