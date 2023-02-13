import { pickEdgeLabel, pickGroupEdgeLabel, pickNodeLabel } from "./data-layer/format-response";
import { StylesheetDefaults } from "./types";
import { colors } from "@mui/material";
import { createTheme, useTheme } from "@mui/material/styles";
import { useMemo } from "react";
import { folderIconBase64 } from "./components/folder-icon";
import {
  CSS_COMPOUND_HIDE_ICON,
  CSS_DEFAULT_GROUP_ICON,
  CSS_DRAWING,
  CSS_FILTERED,
  CSS_FILTERED_HIDDEN,
  CSS_FLASH,
  CSS_GROUP_LABEL_OFFSET,
  CSS_GROUP_LABEL_OFFSET_NEG,
  CSS_HIDDEN,
  CSS_LABEL_OFFSET,
  CSS_LABEL_OFFSET_NEG,
  CSS_PREFIX_TIMELINE,
} from "./data-layer/cy-constants";
import { documentFullscreenElement, edgeToGroupAggregations } from "./utils";

function container() {
  return documentFullscreenElement() ?? document.body;
}

const theme = createTheme({
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
          boxShadow: "none",

          "& .MuiToolbar-root": {
            paddingRight: "8px",
            paddingLeft: "8px",
          },
        },
      },
    },
    MuiToolbar: {
      styleOverrides: {
        root: {
          minHeight: "56px",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          paddingTop: "8px",
          "& .MuiButton-startIcon": {
            position: "relative",
            top: "-1px",
          },
        },
      },
    },
    MuiMenu: {
      defaultProps: {
        container,
      },
    },
    MuiPopover: {
      defaultProps: {
        container,
      },
    },
    MuiTooltip: {
      defaultProps: {
        PopperProps: {
          container,
        },
      },
    },
    MuiDrawer: {
      defaultProps: {
        container,
      },
    },
  },
  palette: {
    background: {
      paper: colors.grey[100],
    },
    custom: {
      compoundNode: "#673ab7",
      compoundSelected: "skyblue",
      nodeSelected: "skyblue",
      edgeSelected: "indianred",
    },
  },
});

// export const ffFontAwesome = '"Font Awesome 5"';
export const ffFontAwesome = '"FontAwesome"';

export function appendFontAwesome(fontFamily: string) {
  return `${fontFamily}, ${ffFontAwesome}`;
}

export function removeFontAwesome(fontFamily: string) {
  return fontFamily.replace(`, ${ffFontAwesome}`, "");
}

export const fontSizes = [...Array(32).keys()].map((i) => i + 9);

export const colorPickerColors = [
  "#f44336",
  "#e91e63",
  "#9c27b0",
  "#673ab7",
  "#3f51b5",
  theme.palette.primary.light,
  "#009688",
  "#4caf50",
  "#8bc34a",
  "#cddc39",
  "#ffeb3b",
  "#ffc107",
  "#ff9800",
  "#ff5722",
  "#795548",
  "#607d8b",
  "#ffffff",
  "#000000",
];

export const fontFamilies = [
  "Arial, sans-serif",
  "Verdana, sans-serif",
  "Helvetica, sans-serif",
  "Tahoma, sans-serif",
  '"Trebuchet MS", sans-serif',
  '"Times New Roman", serif',
  "Georgia, serif",
  "Garamond, serif",
  '"Courier New", monospace',
  '"Brush Script MT", cursive',
].map(appendFontAwesome);

export const timeliteStyles = (() => {
  const stylesheet: Record<string, any> = {};

  const fontFamiliesCn: Record<string, string> = {};
  fontFamilies.forEach((fontFamily) => {
    const cn = `${CSS_PREFIX_TIMELINE}font-family--${fontFamily.replaceAll(" ", "_").replaceAll('"', "").replaceAll(",", "_")}`;
    fontFamiliesCn[cn] = fontFamily;
    stylesheet[`.${cn}`] = {
      "& .vis-item-content": { fontFamily },
    };
  });

  const fontSizesCn: Record<string, string> = {};
  fontSizes.forEach((fontSize) => {
    const cn = `${CSS_PREFIX_TIMELINE}font-size--${fontSize}px`;
    fontSizesCn[cn] = `${fontSize}px`;
    stylesheet[`.${cn}`] = {
      "& .vis-item-content": { fontSize },
    };
  });

  const fontFormatCn: Record<string, string> = {};
  ["italic", "bold"].forEach((fontFormat) => {
    const cn = `${CSS_PREFIX_TIMELINE}font-format--${fontFormat}`;
    fontFormatCn[cn] = fontFormat;
    if (fontFormat === "italic") {
      stylesheet[`.${cn}`] = {
        "& .vis-item-content": { fontStyle: fontFormat },
      };
    }
    if (fontFormat === "bold") {
      stylesheet[`.${cn}`] = {
        "& .vis-item-content": { fontWeight: fontFormat },
      };
    }
  });

  const dotBgStyleCn: Record<string, string> = {};
  const textColorStyleCn: Record<string, string> = {};

  colorPickerColors.forEach((color) => {
    {
      const cn = `${CSS_PREFIX_TIMELINE}dot-bg-color--${color.replace("#", "")}`;
      dotBgStyleCn[cn] = color;
      stylesheet[`.${cn}`] = {
        "& .vis-item.vis-dot": { borderColor: color },
        "&.vis-item.vis-range:not(.vis-selected)": {
          borderColor: color,
          backgroundColor: color,
        },
      };
    }

    {
      const cn = `${CSS_PREFIX_TIMELINE}text-color--${color.replace("#", "")}`;
      textColorStyleCn[cn] = color;
      stylesheet[`.${cn}`] = {
        "& .vis-item-content": { color },
      };
    }
  });

  return {
    fontFamiliesCn,
    fontSizesCn,
    fontFormatCn,
    textColorStyleCn,
    dotBgStyleCn,
    stylesheet,
  };
})();

function renderNodeLabel(element: cytoscape.NodeSingular) {
  const str: string[] = [];

  str.push(pickNodeLabel(element.data("payload")?.label, element.data("payload")?.label_template, element.data("payload")?.data, element.id()));

  if (element.children().length > 0) {
    str.push(`[${element.children().length} узлов]`);
  }

  if (element.data("subIcons")) {
    str.push(element.data("subIcons"));
  }

  return str.join("\n");
}

export const renderEdgeLabel = (edge: cytoscape.EdgeSingular) => {
  return pickEdgeLabel(
    edge.data("label"),
    edge.data("payload")?.label_template || "",
    edge.data("payload")?.data,
    edge.source().data("payload")?.data,
    edge.target().data("payload")?.data,
    edgeToGroupAggregations(edge),
    ""
  );
};

export function useDefaultCyStylesheet(): StylesheetDefaults {
  const theme = useTheme();
  const defaultStylesheet = useMemo<cytoscape.StylesheetStyle[]>(
    () => [
      {
        selector: "node",
        style: {
          label: renderNodeLabel,
          width: 50,
          height: 50,
          "font-family": fontFamilies[0],
          color: theme.palette.getContrastText(theme.palette.common.white),
          "border-color": theme.palette.primary.light,
          "border-width": "2px",
          "font-size": "12px",
          "line-height": 1.2,
          "background-color": theme.palette.common.white,
          "text-wrap": "wrap",
          "text-margin-y": -15,
          "text-max-width": "100px",
          "text-background-color": theme.palette.common.white,
          "text-background-opacity": 0.9,
          "text-background-shape": "roundrectangle",
          "text-background-padding": "6px",
          "min-zoomed-font-size": 12,
        },
      },

      {
        selector: ".transparent",
        style: {
          opacity: 0,
        },
      },

      {
        selector: "node:parent",
        style: {
          "background-color": theme.palette.grey[200],
          "border-opacity": 0,
        },
      },

      {
        selector: "edge, .eh-ghost-edge",
        style: {
          label: renderEdgeLabel,
          "font-size": "12px",
          // @ts-ignore
          "edge-text-rotation": "autorotate",
          color: "#000",
          "text-outline-color": "#fff",
          "text-outline-width": 3,
          width: 2,
          "line-color": theme.palette.grey[300],
          "target-arrow-color": theme.palette.grey[500],
          "target-arrow-shape": "triangle",
          "curve-style": "bezier",
          "min-zoomed-font-size": 12,
          "text-wrap": "wrap",
          "text-overflow-wrap": "anywhere",
          // @ts-ignore
          // "source-text-offset": 1000,
        },
      },
      {
        // Узел свернутой группы
        selector: "node.cy-expand-collapse-collapsed-node",
        style: {
          label: (element: cytoscape.NodeSingular) => {
            const nodesLength = Array.from(element.data("collapsedChildren") as cytoscape.NodeCollection).filter((item) => item.group() === "nodes").length;
            return `${element.data("label")}\n[${nodesLength} узлов]`;
          },
          color: "white",
          "text-background-color": theme.palette.custom.compoundNode,
          shape: "round-rectangle",
        },
      },

      {
        // Развернутая группа
        selector: ":compound",
        style: {
          label: renderNodeLabel,
          color: "white",
          "text-background-color": theme.palette.custom.compoundNode,
          shape: "round-rectangle",
        },
      },

      {
        selector: "edge.cy-expand-collapse-collapsed-edge",
        style: {
          label: pickGroupEdgeLabel,
          "line-style": "dashed",
          "source-arrow-shape": "none",
          "target-arrow-shape": "none",
        },
      },

      {
        selector: `.${CSS_FILTERED}`,
        style: {
          opacity: 0.25,
        },
      },
      {
        selector: `.${CSS_FILTERED_HIDDEN}`,
        style: {
          display: "none",
        },
      },
      {
        selector: `.${CSS_HIDDEN}`,
        style: {
          display: "none",
        },
      },
      {
        selector: `.${CSS_COMPOUND_HIDE_ICON}:compound`,
        style: {
          "background-image-opacity": 0,
        },
      },

      {
        selector: `.${CSS_DEFAULT_GROUP_ICON}`,
        style: {
          "background-image": folderIconBase64,
          "background-width": "65%",
          "background-height": "65%",
        },
      },

      {
        selector: `.${CSS_FLASH}`,
        style: {
          opacity: 0.1,
        },
      },

      {
        selector: `.${CSS_LABEL_OFFSET}`,
        style: {
          "source-label": renderEdgeLabel,
          label: "",
        },
      },

      {
        selector: `.${CSS_LABEL_OFFSET_NEG}`,
        style: {
          "target-label": renderEdgeLabel,
          label: "",
        },
      },

      {
        selector: `.${CSS_GROUP_LABEL_OFFSET}`,
        style: {
          "source-label": pickGroupEdgeLabel,
          label: "",
        },
      },

      {
        selector: `.${CSS_GROUP_LABEL_OFFSET_NEG}`,
        style: {
          "target-label": pickGroupEdgeLabel,
          label: "",
        },
      },

      {
        selector: `.${CSS_DRAWING}`,
        style: {
          shape: "diamond",
          label: "data(label)",
          width: 50,
          height: 50,

          "border-width": "0px",
          "font-size": "12px",
          "background-color": theme.palette.primary.main,
        },
      },
    ],
    [theme]
  );

  const selectedOverrides = useMemo<cytoscape.StylesheetStyle[]>(
    () => [
      {
        selector: "node:selected",
        style: {
          "text-background-color": theme.palette.primary.light,
          color: "white",
          "border-width": 7,
        },
      },

      {
        selector: "node:parent:selected",
        style: {
          "background-color": theme.palette.custom.compoundSelected,
          "background-opacity": 0.2,
        },
      },

      {
        selector: "edge:selected",
        style: {
          width: 7,
          "line-color": theme.palette.custom.edgeSelected,
          "line-fill": "solid",
          "target-arrow-color": theme.palette.custom.edgeSelected,
        },
      },
      {
        selector: "node.cy-expand-collapse-collapsed-node:selected",
        style: {
          "text-background-color": theme.palette.primary.light,
        },
      },
      {
        selector: ":compound:selected",
        style: {
          "text-background-color": theme.palette.primary.light,
        },
      },
    ],
    [theme]
  );

  return { defaultStylesheet, selectedOverrides };
}

export default theme;
