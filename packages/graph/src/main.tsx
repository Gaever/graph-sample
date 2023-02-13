import GlobalStyles from "@vityaz-graph/lib/src/components/global-styles";
import Layout from "@vityaz-graph/lib/src/containers/layout";
import { useGraphDataRequests } from "@vityaz-graph/lib/src/data-layer/use-graph-requests";
import { useResizeObserver } from "@vityaz-graph/lib/src/data-layer/use-resize-observer";
import { dashboardFilter, StylesheetMap } from "@vityaz-graph/lib/src/types";
import React, { useContext, useEffect, useState } from "react";
import ConfirmDialog from "@vityaz-graph/lib/src/containers/confirm-dialog";
import { appStateCtx } from "@vityaz-graph/lib/src/data-layer/app-state-provider";
import GuiContainer from "@/containers/gui-container";

function Main(props: { rootElement: HTMLElement }) {
  const rootElement = props.rootElement;
  const graphIdQueryParam = new URLSearchParams(window.location.search).get("id") || "";
  const graphIdRootDivDataAttr = rootElement.dataset.id || "";
  const deepLinkAttr = rootElement.dataset.deepLink;

  const graphId = graphIdRootDivDataAttr || graphIdQueryParam;
  const [dashboardFilters, setDashboardFilters] = useState<dashboardFilter[] | undefined>(JSON.parse(rootElement.dataset.filters || "null") || undefined);

  const rect = useResizeObserver(rootElement);
  const { loadGraphFromDb, loadIcons, getNodeTypesAndConnectionsListMutation } = useGraphDataRequests();
  const { dispatchGuiAction } = useContext(appStateCtx);

  useEffect(() => {
    const mutationCallback: MutationCallback = (mutationsList) => {
      for (const mutation of mutationsList) {
        if (mutation.type !== "attributes" || mutation.attributeName !== "data-filters") {
          return;
        }
        if (mutation.attributeName === "data-filters") {
          const newDashboardFilters = (mutation.target as HTMLElement)?.dataset?.filters;
          if (!newDashboardFilters) return;
          setDashboardFilters(JSON.parse(newDashboardFilters));
        }
      }
    };
    const datasetMutationObserver = new MutationObserver(mutationCallback);

    datasetMutationObserver.observe(rootElement, { attributes: true });

    dispatchGuiAction({ type: "SET_IS_DASHBOARD", payload: !!rootElement.dataset.isDashboard });

    return () => {
      datasetMutationObserver.disconnect();
    };
  }, []);

  async function doLoadGraph(id: string) {
    try {
      const stylesheetMap: StylesheetMap = new Map();
      const nodeTypesAndConnections = await getNodeTypesAndConnectionsListMutation.mutateAsync();
      await loadIcons(stylesheetMap);
      await loadGraphFromDb(id, stylesheetMap, nodeTypesAndConnections.data.data || { node_types: [], connections: [] });
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    doLoadGraph(graphId);
    const changeIdListener: React.EventHandler<any> = (event) => {
      // Слушаем событие на смену id графа
      const id = event.detail.id;
      doLoadGraph(id);
    };

    window.addEventListener("knight-id", changeIdListener);

    return () => {
      window.removeEventListener("knight-id", changeIdListener);
    };
  }, []);

  return (
    <>
      <Layout rect={rect}>
        <GuiContainer containerHeight={rect.height} containerWidth={rect.width} rootElement={props.rootElement} dashboardFilters={dashboardFilters} deepLink={deepLinkAttr} />
      </Layout>
      <GlobalStyles />
      <ConfirmDialog />
    </>
  );
}

export default Main;
