import { LegendProps } from "../components/legend";
import { SCRATCH_LEGEND_SHALL_UPDATE, SCRATCH_MERGE_MODE } from "./cy-constants";
import { ConnectionTypesMap, LegendSettingsState, NodeTypesMap } from "../types";
import { getNodeGroupChildren, isCollapsedGroup, isEdge, isEdgeGroup, isNode, isNodeGroup } from "../utils";
import { EdgeCollection } from "cytoscape";
import { useContext, useEffect, useState } from "react";
import { appStateCtx } from "./app-state-provider";

export default function useLegend() {
  const { cy, guiState } = useContext(appStateCtx);

  const [legendProps, setLegendProps] = useState<
    Pick<LegendProps, "nodesCount" | "edgesCount" | "hiddenNodesCount" | "hiddenEdgesCount" | "nodesByIcons" | "nodesByNodeTypes" | "nodesWoIcons" | "edgesByEdgeTypes"> &
      Pick<LegendSettingsState, "usedNodeIcons">
  >({
    nodesCount: 0,
    edgesCount: 0,
    hiddenNodesCount: 0,
    hiddenEdgesCount: 0,
    nodesWoIcons: 0,
    nodesByIcons: new Map(),
    nodesByNodeTypes: new Map(),
    edgesByEdgeTypes: new Map(),
    usedNodeIcons: new Set(),
  });

  const [mergeMode, setMergeMode] = useState();
  const [prevMergeMode, setPrevMergeMode] = useState();

  useEffect(() => {
    if (cy?.scratch(SCRATCH_LEGEND_SHALL_UPDATE)) {
      cy?.removeScratch(SCRATCH_LEGEND_SHALL_UPDATE);
      refreshLegend();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cy?.scratch(SCRATCH_LEGEND_SHALL_UPDATE), cy, guiState]);

  useEffect(() => {
    setMergeMode(cy?.scratch(SCRATCH_MERGE_MODE));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cy?.scratch(SCRATCH_MERGE_MODE)]);

  useEffect(() => {
    refreshLegend(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guiState.legendSettings.show]);

  useEffect(() => {
    if (mergeMode !== prevMergeMode) {
      if (!!prevMergeMode && !mergeMode) {
        // Костыль для отслеживания момента мержа двух узлов.
        refreshLegend();
      }
      setPrevMergeMode(mergeMode);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mergeMode, prevMergeMode, cy, guiState]);

  const refreshLegend = (force?: boolean) => {
    // Расчет статистики - дорогая операция,
    // требующая полного перебора всех элементов на графе.
    // Следует вызывать явно при изменении иконки, system_id,
    // добавлении, удалении, скрытии и отображении элементов
    requestAnimationFrame(() => {
      if (!cy || (!guiState.legendSettings.show && !force)) {
        return;
      }

      let nodesCount = 0;
      let edgesCount = 0;
      let hiddenNodesCount = 0;
      let hiddenEdgesCount = 0;
      let nodesWoIcons = 0;
      const nodesByIcons: Map<string, number> = new Map();
      const nodesByNodeTypes: Map<string, number> = new Map();
      const edgesByEdgeTypes: Map<string, number> = new Map();
      const usedNodeIcons: Set<string> = new Set();

      function collectNodeInfo(node: cytoscape.NodeSingular) {
        if (node.group() !== "nodes") return;

        const iconKey = node.data("payload")?.icon;
        const systemId = node.data("payload")?.system_id;

        if (iconKey) {
          nodesByIcons.set(iconKey, (nodesByIcons.get(iconKey) || 0) + 1);
          usedNodeIcons.add(iconKey);
        } else {
          nodesWoIcons++;
        }

        if (systemId) {
          nodesByNodeTypes.set(systemId, (nodesByNodeTypes.get(systemId) || 0) + 1);
        }
      }

      function collectEdgeInfo(edge: cytoscape.EdgeSingular) {
        if (edge.group() !== "edges") return;

        const systemId = edge.data("payload")?.system_id;
        if (systemId) {
          edgesByEdgeTypes.set(systemId, (edgesByEdgeTypes.get(systemId) || 0) + 1);
        }
      }

      cy.batch(() => {
        cy.elements().forEach((element) => {
          if (isNodeGroup(element)) {
            const children = getNodeGroupChildren(element);
            if (!isCollapsedGroup(element)) return;
            const groupIsHidden = element.hidden();

            children.forEach((item) => {
              if (item.group() === "edges" && (item.hidden() || groupIsHidden)) {
                hiddenEdgesCount++;
              }
              if (item.group() === "edges" && !item.hidden() && !groupIsHidden) {
                edgesCount++;
              }
              if (item.group() === "nodes" && (item.hidden() || groupIsHidden)) {
                hiddenNodesCount++;
              }
              if (item.group() === "nodes" && !item.hidden() && !groupIsHidden) {
                nodesCount++;
              }
            });

            children.forEach(collectNodeInfo);
          } else if (isNode(element)) {
            if (element.hidden()) {
              hiddenNodesCount++;
            } else {
              nodesCount++;
            }
            collectNodeInfo(element);
          } else if (isEdgeGroup(element)) {
            if (element.hidden()) {
              hiddenEdgesCount += (element.data("collapsedEdges") as EdgeCollection).length;
            } else {
              edgesCount += (element.data("collapsedEdges") as EdgeCollection).length;
            }
          } else if (isEdge(element)) {
            if (element.hidden()) {
              hiddenEdgesCount++;
            } else {
              edgesCount++;
            }
            collectEdgeInfo(element);
          }
        });
      });

      setLegendProps({
        nodesCount,
        edgesCount,
        hiddenNodesCount,
        hiddenEdgesCount,
        nodesWoIcons,
        nodesByIcons,
        nodesByNodeTypes,
        edgesByEdgeTypes,
        usedNodeIcons,
      });
    });
  };

  return { legendProps, refreshLegend };
}
