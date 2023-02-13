import { Field } from "../../../http/api";
import { ClusterFieldVariant, CyCallbackAction, UseDispatchCyActionProps } from "../../../types";
import cytoscape from "cytoscape";

export function clusterAction(cy: cytoscape.Core, action: CyCallbackAction, props: UseDispatchCyActionProps) {
  if (action.type !== "CLUSTER") return;

  const nodeAttributes = Array.from(props.graphState.attributesMap.values());
  const nodeAttributesToIndex: Record<string, number> = {};
  nodeAttributes.forEach((attribute, index) => {
    nodeAttributesToIndex[attribute] = index;
  });

  const systemIds = Array.from(props.graphState.nodeSystemIds.values());
  const systemIdToIndex: Record<string, number> = {};
  systemIds.forEach((systemId, index) => {
    systemIdToIndex[systemId] = index;
  });

  const clusterIndecies: Map<string, number> = new Map();
  clusterIndecies.set("__UNCLUSTERED__", 0);

  function clusterMapper(args: { fieldVariant: ClusterFieldVariant; attributeKey?: string; clusterIndecies: Map<string, number> }) {
    return function (node: cytoscape.NodeSingular) {
      let value: string | undefined = undefined;
      if (args.fieldVariant === "system_id") {
        value = node.data("payload")?.system_id;
      }
      if (args.fieldVariant === "attribute") {
        value = ((node.data("payload")?.data || []) as Field[])?.find((item) => item.key === args.attributeKey)?.value;
      }

      if (!value) {
        return 0;
      }

      const clusterIndex = args.clusterIndecies.get(value);

      if (!clusterIndex) {
        const index = args.clusterIndecies.size / 1.1;

        args.clusterIndecies.set(value, index);
        return index;
      }

      return clusterIndex;
    };
  }

  function fillHoles(arr: any[]) {
    for (let i = 0; i < arr.length; i++) {
      if (arr[i] === undefined) arr[i] = [];
    }
  }

  let clusters: any = [];

  const layoutOptions = {
    name: "cise",
    idealInterClusterEdgeLengthCoefficient: 15,
    animate: false,
    fit: true,
    nodeSeparation: 10,
    allowNodesInsideCircle: true,
    clusters: null,
  };

  const elements = cy.elements("*[id !*= 'drawing']");

  switch (action.payload.algo) {
    case "kMeans": {
      // @ts-ignore
      clusters = elements.kMeans({
        k: action.payload.algoOptions?.k || 2,
        attributes: [clusterMapper({ fieldVariant: action.payload.clusterFieldVariant, clusterIndecies, attributeKey: action.payload.attributeKey })],
      });
      fillHoles(clusters);
      // @ts-ignore
      layoutOptions.clusters = clusters.map((item) => {
        // @ts-ignore
        return item.map((item) => {
          return item.id();
        });
      });
      break;
    }

    case "kMedoids": {
      // @ts-ignore
      clusters = elements.kMedoids({
        k: action.payload.algoOptions?.k || 2,
        attributes: [clusterMapper({ fieldVariant: action.payload.clusterFieldVariant, clusterIndecies, attributeKey: action.payload.attributeKey })],
      });
      fillHoles(clusters);
      // @ts-ignore
      layoutOptions.clusters = clusters.map((item) => {
        // @ts-ignore
        return item.map((item) => {
          return item.id();
        });
      });
      break;
    }

    case "fuzzyCMeans": {
      // @ts-ignore
      clusters = elements.fuzzyCMeans({
        attributes: [clusterMapper({ fieldVariant: action.payload.clusterFieldVariant, clusterIndecies, attributeKey: action.payload.attributeKey })],
      });
      fillHoles(clusters.clusters);
      // @ts-ignore
      layoutOptions.clusters = clusters.clusters.map((item, index) => {
        // @ts-ignore
        return item.map((item) => {
          return item.id();
        });
      });
      break;
    }

    case "hierarchicalClustering": {
      // @ts-ignore
      clusters = elements.hierarchicalClustering({
        mode: "threshold",
        threshold: 25,
        attributes: [clusterMapper({ fieldVariant: action.payload.clusterFieldVariant, clusterIndecies, attributeKey: action.payload.attributeKey })],
      });

      fillHoles(clusters);
      // @ts-ignore
      layoutOptions.clusters = clusters.map((item, index) => {
        // @ts-ignore
        return item.map((item) => {
          return item.id();
        });
      });
      break;
    }

    case "affinityPropagation": {
      // @ts-ignore
      clusters = elements.affinityPropagation({
        attributes: [clusterMapper({ fieldVariant: action.payload.clusterFieldVariant, clusterIndecies, attributeKey: action.payload.attributeKey })],
        // attributes: [() => Math.random()],
        damping: 0.8,
        preference: "median",
      });

      fillHoles(clusters);
      // @ts-ignore
      layoutOptions.clusters = clusters.map((item) => {
        // @ts-ignore
        return item.map((item) => {
          return item.id();
        });
      });
      break;
    }
  }

  cy.layout(layoutOptions).run();
}
