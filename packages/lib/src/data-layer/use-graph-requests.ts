import { useSnackbar } from "notistack";
import { useCallback, useContext } from "react";
import { useMutation } from "react-query";
import api from "../http";
import { Graph, NodeTypeList, NodeTypesAndConnections } from "../http/api";
import { NodeTemplate, OnSearchCreateRequest, StylesheetMap } from "../types";
import { appStateCtx } from "./app-state-provider";
import { useErrorHandler } from "./use-error-handler";
import { useGraphData } from "./use-graph-data";
import { useProgressBar } from "./use-progress-bar";
import { Base64 } from "js-base64";

export function useGraphDataRequests(props?: { createNodeMutationOnSuccess?: () => void }) {
  const { storeGraphDataWithConfirmation, createSnapshot, mergeGraph, storeNewIcons } = useGraphData();
  const { graphState, cy, dispatchGraphAction, dispatchGuiAction, dispatchCyAction } = useContext(appStateCtx);
  const { errorHandler } = useErrorHandler();

  const { enqueueSnackbar } = useSnackbar();
  const progress = useProgressBar();

  const reqParams = {
    onMutate() {
      progress.start();
    },
    onSettled() {
      progress.done();
    },
    onError: errorHandler,
  };

  const treesDetailMutation = useMutation(
    async (args: { graphId: string; stylesheetMap: StylesheetMap; nodeTypesAndConnections: NodeTypesAndConnections }) => api.trees.treesDetail(args.graphId),
    {
      ...reqParams,
      onSuccess: (response, variables) => {
        storeGraphDataWithConfirmation(response.data, variables.stylesheetMap, variables.nodeTypesAndConnections);
      },
    }
  );

  const treesUpdateMutation = useMutation(async (args: { id: string; data: Graph }) => api.trees.treesUpdate(args.id, args.data), {
    ...reqParams,
    onSuccess() {
      enqueueSnackbar("Граф сохранен");
      dispatchGuiAction({ type: "SET_IS_GRAPH_UNSAVED", payload: false });
    },
  });

  const loadGraphFromDb = async (graphId: string, stylesheetMap: StylesheetMap, nodeTypesAndConnections: NodeTypesAndConnections) => {
    if (graphId) {
      dispatchGuiAction({ type: "SET_IS_GRAPH_UNSAVED", payload: false });
      dispatchGraphAction({ type: "SET_GRAPH_ID", payload: graphId });
      treesDetailMutation.mutate({ graphId, stylesheetMap, nodeTypesAndConnections });
    } else {
      errorHandler("id графа не указан");
    }
  };

  const saveGraphToDb = useCallback(async () => {
    try {
      if (!graphState.graphId) {
        throw new Error("Не указан id графа");
      }
      const { graph } = await createSnapshot();
      treesUpdateMutation.mutate({ id: graphState.graphId || "", data: graph });
    } catch (error) {
      errorHandler(error);
    }
  }, [cy, graphState]);

  const createSearchRequestMutation = useMutation(
    async (args: Parameters<OnSearchCreateRequest>[0]) =>
      api.searches.searchesCreate(
        {
          treeId: +(graphState.graphId || 0),
          is_favorites: args.is_favorites,
          name: args.name,
          nodes: args.nodes,
          search_type: args.search_type,
          request_params: args.request_params,
        },
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      ),
    {
      onSuccess() {
        enqueueSnackbar("Запрос создан");
      },
    }
  );

  const createSearchRequest = useCallback<OnSearchCreateRequest>(async (data) => {
    try {
      await createSearchRequestMutation.mutateAsync(data);
      getSearchesMutation.mutate();
    } catch (error) {
      errorHandler(error);
    }
  }, []);

  const updateSearchMutation = useMutation(
    async (args: { id: number; data: Parameters<OnSearchCreateRequest>[0] }) =>
      api.searches.searchesUpdate(args.id, args.data, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }),
    {
      ...reqParams,
      onSuccess() {
        enqueueSnackbar("Поисковый запрос обновлен");
      },
    }
  );

  const getSearchesMutation = useMutation(async () => api.searches.searchesList(), {
    onError: errorHandler,
  });

  const getSearchMutation = useMutation(async (id: number) => api.searches.searchesDetail(id), {
    ...reqParams,
    onSuccess: async (response) => {
      const classesToRequest = await mergeGraph(response.data.data?.response_nodes || [], response.data.data?.response_connections || []);
      if (classesToRequest !== null) {
        enqueueSnackbar("Данные добавлены на граф");
        getStylesheetsMutation.mutate(Array.from(classesToRequest.values()));
      }
    },
  });

  const getIconsMutation = useMutation(async () => api.icons.iconsList(), {
    onError: errorHandler,
  });

  const loadIcons = async (stylesheetMap: StylesheetMap) => {
    try {
      const response = await getIconsMutation.mutateAsync();
      const newIcons = response?.data?.data || [];
      storeNewIcons(newIcons, stylesheetMap);
    } catch (error) {
      errorHandler(error);
    }
  };

  const updateAttributeMutation = useMutation(
    async (args: { systemId: string; itemId: string; data: any }) =>
      api.items.itemsUpdate(args.systemId, Base64.encode(args.itemId), args.data, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }),
    {
      ...reqParams,
      onSuccess: () => {
        enqueueSnackbar("Обновлено");
      },
    }
  );

  const getNodeTypesMutation = useMutation(async () => api.nodeTypes.nodeTypesList(), {
    onError: errorHandler,
  });

  const createNodeMutation = useMutation(
    async (args: NodeTemplate) => {
      const r1 = await getNodeTypesAndConnectionsListMutation.mutateAsync();
      const r2 = await api.itemsCreate.itemsCreateCreate(
        args.systemId,
        { fields: args.attributes || [] },
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );

      return { node: r2.data, nodeTypesAndConnections: r1.data.data || { node_types: [], connections: [] } };
    },
    {
      onSuccess: (response) => {
        dispatchCyAction({
          type: "ADD_NODE",
          payload: response,
          callback: (node) => {
            if (node?.hidden?.()) {
              enqueueSnackbar("Созданный узел скрыт в соответствии с настройками фильтров");
            }
          },
        });
        getNodeTemplateMutation.reset();
        props?.createNodeMutationOnSuccess?.();
      },
      onError: errorHandler,
    }
  );

  const getNodeTemplateMutation = useMutation(
    async (args: NodeTypeList) => {
      const response = await api.nodeTypes.templateDetail(args.system_id || "");
      const isRequired = (response.data.fields || []).some((item) => item.key === response.data.key_field);

      const data: NodeTemplate = {
        attributes: response.data.fields || [],
        requiredKey: isRequired ? response.data.key_field : "",
        systemId: args.system_id || "",
        label: args.label || "",
        icon: args.icon || "",
      };
      return data;
    },
    {
      onSuccess: (response, variables) => {
        if (!response.requiredKey) {
          createNodeMutation.mutate({ attributes: response.attributes || [], icon: variables.icon || "", label: variables.label || "", systemId: variables.system_id || "" });
        }
      },
      onError: errorHandler,
    }
  );

  const getNodeConnectionsMutation = useMutation(
    async (args: { systemId: string; itemId: string; guid: string }) => api.items.connectedCountDetail(args.systemId, Base64.encode(args.itemId)),
    {
      onSuccess: (response, variables) => {
        dispatchCyAction({ type: "SET_CONNECTIONS_COUNT", payload: { guid: variables.guid, count: response.data.count || "" } });
      },
      onError: errorHandler,
    }
  );
  const getNodeConnectionStatisticMutation = useMutation(
    async (args: { id: any; system_id: any }[]) => Promise.all(args.map(async (arg) => (await api.items.connectedCountDetail(arg.system_id, Base64.encode(arg.id))).data)),
    {
      onError: errorHandler,
    }
  );

  const getSnapshotsMutation = useMutation(async () => api.treeSnapshots.treeSnapshotsList({ tree_id: +(graphState.graphId || 0) }), {
    onError: errorHandler,
  });

  const getSnapshotMutation = useMutation(async (args: { snapshotId: number }) => api.treeSnapshots.treeSnapshotsDetail(args.snapshotId), {
    ...reqParams,
  });

  const createSnapshotMutation = useMutation(
    async (args: { graph: Graph }) =>
      api.treeSnapshots.treeSnapshotsCreate(args.graph, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }),
    {
      ...reqParams,
    }
  );

  const deleteSnapshotMutation = useMutation(
    async (args: { snapshotId: number }) =>
      api.treeSnapshots.treeSnapshotsDelete(args.snapshotId, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }),
    {
      onError: errorHandler,
    }
  );

  const updateSnapshotMutation = useMutation(
    async (args: { snapshotId: number; graph: Graph }) =>
      api.treeSnapshots.treeSnapshotsUpdate(args.snapshotId, args.graph, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }),
    {
      ...reqParams,
    }
  );

  const createRemoteSnapshot = async () => {
    try {
      const { graph } = await createSnapshot();
      await createSnapshotMutation.mutateAsync({ graph });
      enqueueSnackbar("Снимок создан");

      getSnapshotsMutation.mutate();
    } catch (error) {
      errorHandler(error);
    }
  };

  const updateSnapshot = async (snapshotId: number) => {
    try {
      const { graph } = await createSnapshot();
      await updateSnapshotMutation.mutateAsync({ snapshotId, graph });
      enqueueSnackbar("Снимок обновлен");

      getSnapshotsMutation.mutate();
    } catch (error) {
      errorHandler(error);
    }
  };

  const deleteSnapshot = async (snapshotId: number) => {
    try {
      await deleteSnapshotMutation.mutateAsync({ snapshotId });
      enqueueSnackbar("Снимок удален");

      getSnapshotsMutation.mutate();
    } catch (error) {
      errorHandler(error);
    }
  };

  const loadSnapshot = async (snapshotId: number) => {
    try {
      const response = await getSnapshotMutation.mutateAsync({ snapshotId });
      const snapshot = response.data.data;
      const nodeTypesAndConnectionsMutation = await getNodeTypesAndConnectionsListMutation.mutateAsync();

      if (!snapshot) throw new Error("Не удалось загрузить снимок");
      enqueueSnackbar("Снимок загружен");

      const stylesheetMap: StylesheetMap = new Map();
      await loadIcons(stylesheetMap);
      const shallSetIsGraphUnsaved = await storeGraphDataWithConfirmation(
        snapshot,
        stylesheetMap,
        nodeTypesAndConnectionsMutation.data.data || { node_types: [], connections: [] }
      );

      if (shallSetIsGraphUnsaved) {
        requestAnimationFrame(() => {
          dispatchGuiAction({ type: "SET_IS_GRAPH_UNSAVED", payload: true });
        });
      }
    } catch (error) {
      errorHandler(error);
    }
  };

  const getStylesheetsMutation = useMutation(
    async (_classes: string[]) => {
      const response: cytoscape.StylesheetStyle[] = [
        {
          selector: ".development",
          style: {
            "border-color": "red",
            width: "100px",
            height: "100px",
          },
        },
      ];
      return response;
    },
    {
      ...reqParams,
    }
  );

  const loadStylesheets = async () => {
    try {
      const response = await getStylesheetsMutation.mutateAsync([]);
      const stylesheetMap = new Map(graphState.stylesheetMap);

      response.forEach((item) => {
        stylesheetMap.set(item.selector, item);
      });
      dispatchGraphAction({ type: "SET_STYLESHEET_MAP", payload: stylesheetMap });
      dispatchCyAction({ type: "REFRESH_STYLESHEET", payload: stylesheetMap });
    } catch (error) {
      errorHandler(error);
    }
  };

  const connectionsDetailMutation = useMutation(async (systemId: string) => api.nodeTypes.connectionsDetail(systemId));

  const getNodeTypesAndConnectionsListMutation = useMutation(async () => api.nodeTypesAndConnections.nodeTypesAndConnectionsList());

  const getMetagroupsMutation = useMutation(async () => api.metagroupsNodesMetafields.metagroupsNodesMetafieldsList());

  return {
    treesDetailMutation,
    getSearchesMutation,
    getSearchMutation,
    updateSearchMutation,
    createSearchRequestMutation,
    updateAttributeMutation,
    getNodeTypesMutation,
    getIconsMutation,
    createNodeMutation,
    getNodeConnectionsMutation,
    getNodeConnectionStatisticMutation,
    getSnapshotsMutation,
    deleteSnapshotMutation,
    updateSnapshotMutation,
    getNodeTemplateMutation,
    getStylesheetsMutation,
    connectionsDetailMutation,
    getNodeTypesAndConnectionsListMutation,
    getMetagroupsMutation,
    loadGraphFromDb,
    saveGraphToDb,
    createSearchRequest,
    loadIcons,
    createRemoteSnapshot,
    updateSnapshot,
    loadSnapshot,
    loadStylesheets,
    deleteSnapshot,
    progress,
    errorHandler,
  };
}
