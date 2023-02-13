/// <reference path="node_modules/@types/cytoscape/index.d.ts" />

declare module "cytoscape-expand-collapse";
declare namespace cytoscape {
  import cytoscape from "cytoscape";

  interface ExpandCollapseApi {
    collapseAll: (options?: any) => void;
    expandAll: (options?: any) => void;
    collapse: (nodes: any, options?: any) => void;
    expand: (nodes: any, options?: any) => void;
    getParent: (id: string) => cytoscape.NodeSingular;
    getCollapsedChildren: (node: cytoscape.NodeSingular) => any;
    isExpandable: (node: cytostape.NodeCollection) => boolean;
    isCollapsible: (node: cytostape.NodeCollection) => boolean;
    expandableNodes: (node?: cytostape.NodeCollection) => cytostape.NodeCollection;
    collapsibleNodes: (node?: cytostape.NodeCollection) => cytostape.NodeCollection;
    collapseEdges: (edges: cytoscape.EdgeCollection, options?: any) => cytoscape.EdgeCollection;
    expandEdges: (edges: cytoscape.EdgeCollection, options?: any) => cytoscape.EdgeCollection;
  }

  type ExpandCollapseOptions = Partial<{
    layoutBy: cytoscape.LayoutOptions;
    fisheye: boolean;
    animate: boolean;
    animationDuration: number;
    ready: () => void;
    undoable: boolean;

    cueEnabled: boolean;
    expandCollapseCuePosition: "top-left" | ((node: cytostape.NodeCollection) => cytoscape.Position);
    expandCollapseCueSize: number;
    expandCollapseCueLineSize: number;
    expandCueImage: string;
    collapseCueImage: string;
    expandCollapseCueSensitivity: number;

    edgeTypeInfo: string;
    groupEdgesOfSameTypeOnCollapse: boolean;
    allowNestedEdgeCollapse: boolean;
    zIndex: number;
  }>;

  interface ExpandCollapseDataDefinition extends cytoscape.NodeDataDefinition {
    collapsed: boolean | undefined;
    collapsedChildren: cytoscape.ElementDefinition;
  }

  interface Core {
    expandCollapse(options: "get" | ExpandCollapseOptions): ExpandCollapseApi;
  }
}
