import { Connection, Field, Graph, Group, MetaField, Node, NodeTypesAndConnections } from "../http/api";
import { ConnectionTypesMap, CyEdge, CyGroup, CyNode, ElementFormatterAggregation, GraphElements, GraphState, GroupAggregation, NodeTypesMap, StylesheetMap } from "../types";
import { edgeToEdgeGroupAggregations, edgeToGroupAggregations, groupAggregationsToLabel } from "../utils";
import { sha256 } from "js-sha256";
import _set from "lodash/set";
import _toPath from "lodash/toPath";
import _unescape from "lodash/unescape";
import _uniq from "lodash/uniq";
import Mustache from "mustache";
import { v4 as uuid } from "uuid";
import { CSS_AGGREGATIONS, CSS_COMPOUND_HIDE_ICON, CSS_DEFAULT_GROUP_ICON, CSS_PREFIX_ICON, CSS_PREFIX_USER_STYLE } from "./cy-constants";
import { getElementDefinitionClassesByConditionStylesheets } from "./cy-functions/cy-actions/apply-condition-stylesheet-action";

export function nodeTypesAndConnectionsToMaps(nodeTypesAndConnections: NodeTypesAndConnections, existNodeTypes?: NodeTypesMap, existEdgeTypes?: ConnectionTypesMap) {
  const nodeTypesMap: NodeTypesMap = new Map(existNodeTypes);
  const connectionTypesMap: ConnectionTypesMap = new Map(existEdgeTypes);

  (nodeTypesAndConnections.node_types || []).forEach((item) => {
    if (!item.system_id) {
      return;
    }
    nodeTypesMap.set(item.system_id, item);
  });

  (nodeTypesAndConnections.connections || []).forEach((item) => {
    if (!item.system_id) {
      return;
    }

    connectionTypesMap.set(item.system_id, item);
  });

  return { nodeTypesMap, connectionTypesMap };
}

export function mergeSystemTypes(types1: NodeTypesAndConnections, types2: NodeTypesAndConnections): NodeTypesAndConnections {
  const map1 = nodeTypesAndConnectionsToMaps(types1);
  const map2 = nodeTypesAndConnectionsToMaps(types2);

  const mergedNodeTypes: NodeTypesMap = new Map([...map1.nodeTypesMap, ...map2.nodeTypesMap]);
  const mergedConnectionTypes: ConnectionTypesMap = new Map([...map1.connectionTypesMap, ...map2.connectionTypesMap]);

  return {
    connections: Array.from(mergedConnectionTypes.values()),
    node_types: Array.from(mergedNodeTypes.values()),
  };
}

export function labelTemplateToLabel(template: string, elementAttributes: Field[], sourceNodeAttributes?: Field[], targetNodeAttributes?: Field[]) {
  if (!template) return "";

  try {
    // Mustache преобразует экранированные символы в unicode последовательность (например \/ (экранированный слэш) будет преобразован в текст #x2f;)
    // Чтобы этого избежать, добавляем инструкцию не обрабатывать экранированные символы - {{{ variable }}}
    const unescapeCharactersTemplate = template.replaceAll("{{", "{{{").replaceAll("}}", "}}}");

    const keysInTemplate: string[] = [];
    const parsed = Mustache.parse(unescapeCharactersTemplate);
    for (let entry of parsed) {
      if (entry[0] === "name" || entry[0] === "&") {
        keysInTemplate.push(entry[1]);
      }
    }

    const values: Record<string, string> = {};
    keysInTemplate.forEach((key) => {
      const path = _toPath(key);
      let entry: Field | undefined = undefined;

      if (path.length > 1 && path[0] === "from") {
        entry = (sourceNodeAttributes || []).find((item) => item.label === path[1] || item.key === path[1]);
      } else if (path.length > 1 && path[0] === "to") {
        entry = (targetNodeAttributes || []).find((item) => item.label === path[1] || item.key === path[1]);
      } else {
        entry = elementAttributes.find((item) => item.label === key || item.key === key);
      }

      _set(values, path, entry?.formattedValue || entry?.value || "");
    });
    const rend = _unescape(Mustache.render(unescapeCharactersTemplate, values));
    return rend;
  } catch (err) {
    return "";
  }
}

export function pickNodeLabel(label: string | undefined, labelTemplate: string | undefined, elementAttributes: Field[] | undefined, fallback: string | undefined): string {
  return labelTemplateToLabel(labelTemplate || "", elementAttributes || []) || label || fallback || "";
}

export function pickEdgeLabel(
  label: string | undefined,
  labelTemplate: string | undefined,
  elementAttributes: Field[] | undefined,
  sourceNodeAttributes: Field[] | undefined,
  targetNodeAttributes: Field[] | undefined,
  groupAggregations: GroupAggregation[] | undefined,
  fallback: string | undefined
): string {
  return (
    groupAggregationsToLabel(groupAggregations) ||
    labelTemplateToLabel(labelTemplate || "", elementAttributes || [], sourceNodeAttributes || [], targetNodeAttributes || []) ||
    label ||
    fallback ||
    ""
  );
}

export function pickDefaultGroupEdgeLabel(element: cytoscape.EdgeSingular): string {
  const childrenLength = element.data("collapsedEdges")?.length || 0;
  return `связей: ${childrenLength}`;
}

export function pickGroupEdgeLabel(element: cytoscape.EdgeSingular): string {
  const groupAggregations = edgeToGroupAggregations(element);
  const edgeGroupAggregations = edgeToEdgeGroupAggregations(element);

  const aggregations = (groupAggregations.length > 0 && groupAggregations) || (edgeGroupAggregations.length > 0 && edgeGroupAggregations) || [];

  return pickEdgeLabel(
    element.data("label"),
    "",
    [],
    element.source().data("payload")?.data,
    element.target().data("payload")?.data,
    aggregations,
    pickDefaultGroupEdgeLabel(element)
  );
}

export function getCompoundNodeId(groupId: string | number): string {
  if (groupId.toString().indexOf("group") === -1) {
    return `group-${groupId}`;
  }
  return groupId.toString();
}

export function createCompoundNodeId() {
  return getCompoundNodeId(sha256(uuid() + new Date().getTime().toString()));
}

export function hashStyle(style?: cytoscape.StylesheetStyle["style"]) {
  if (!style) return "";
  return `${CSS_PREFIX_USER_STYLE}${sha256(JSON.stringify(style))}`;
}

export function getIconClassName(iconKey: string) {
  if (!iconKey) return "";
  return `${CSS_PREFIX_ICON}${iconKey}`;
}

// font-family в стиле должен содержать шрифт "Font Awesome 5". Добавляем если он отсутствует
// function appendFontAwesomeFontFamily(style: cytoscape.StylesheetStyle["style"]) {
//   // @ts-ignore
//   if (style["font-family"] && style["font-family"]?.indexOf?.(ffFontAwesome) === -1) {
//     // @ts-ignore
//     style["font-family"] = `${style["font-family"]}, ${ffFontAwesome}`;
//   }
// }

export function addIconToStylesheet(base64src: string, className: string, stylesheetMap: StylesheetMap) {
  const selector = `.${className}`;
  if (base64src?.substring?.(0, 18) === "data:image/svg+xml") {
    // svg и растровые картинки по разному реагируют на background-fit
    stylesheetMap.set(selector, {
      selector,
      style: { "background-image": base64src, "background-width": "65%", "background-height": "65%" },
    });
  } else {
    stylesheetMap.set(selector, {
      selector,
      style: {
        "background-image": base64src,
        "background-fit": "contain",
        "background-height": "auto",
        "background-width": "auto",
      },
    });
  }
}

// cytoscape не отображает svg если в корневом элементе не указаны явно width и height.
// Вписываем их, установив в 30px по умолчанию
export function fixSvgWithoutWidthHeight(svgBase64: string) {
  const prefix = "data:image/svg+xml;base64,";
  const base64 = svgBase64.replace(prefix, "");

  const xmlStr = atob(base64);

  let fixedStr = xmlStr.replaceAll(/[\s|\n|\t]/g, " ");

  const regexp = /<svg(\s?.*?)>/gim;
  const rootStr = fixedStr.match(regexp)?.[0] || "";

  if (rootStr.indexOf("width") === -1) {
    fixedStr = fixedStr.replace(regexp, `<svg $1 width="30">`);
  }

  if (rootStr.indexOf("height") === -1) {
    fixedStr = fixedStr.replace(regexp, `<svg $1 height="30">`);
  }

  const fixedBase64 = btoa(fixedStr);

  return `${prefix}${fixedBase64}`;
}

export function addIconsToStylesheet(icons: Graph["icons"], stylesheetMap: StylesheetMap) {
  let correctIcons = icons || {};
  const iconKeys = Object.keys(icons || {});

  if (iconKeys[0] && typeof icons?.[iconKeys?.[0]] === "string") {
    iconKeys.forEach((iconKey) => {
      const src = icons[iconKey];
      correctIcons[iconKey] = {
        label: iconKey,
        // @ts-ignore
        src,
        // @ts-ignore
        sha256: sha256(src),
      };
    });
  }

  Object.keys(correctIcons || {}).forEach((iconKey) => {
    const className = getIconClassName(iconKey);
    if (!icons?.[iconKey]?.src) return;
    const fixedSrc = fixSvgWithoutWidthHeight(icons[iconKey].src || "");
    addIconToStylesheet(fixedSrc, className, stylesheetMap);
  });
}

export function formatGroupNode(group: Group, outElements: GraphElements["groups"], aggr: ElementFormatterAggregation): CyGroup {
  if (!group.id) {
    console.error("Нет id для группы", group);
    throw new Error("Нет id для группы");
  }

  const groupId = getCompoundNodeId(group.id || 0);

  if (outElements.has(groupId)) {
    throw new Error(`Дубликат группы с id ${groupId}`);
  }

  const classes: string[] = Array.isArray(group.classes) ? group.classes : [];

  (group.classes || []).forEach((className) => {
    if (!aggr.stylesheetMap.has(className)) {
      aggr.classesToRequest?.add?.(className);
    }
  });

  classes.push(CSS_DEFAULT_GROUP_ICON);

  if ((group.aggregations || []).length > 0) {
    classes.push(CSS_AGGREGATIONS);
  }
  classes.push(CSS_COMPOUND_HIDE_ICON);

  const formattedGroup: CyGroup = {
    data: {
      id: groupId,
      label: group.label || "Группа",
      className: hashStyle({}),
      payload: group,
      collapsed: group.collapsed,
    },
    classes: _uniq(classes).join(" "),
  };

  outElements.set(groupId, formattedGroup);

  return formattedGroup;
}

export function getAggregatedAttributeLabel(attributesMap: GraphState["attributesMap"], attribute: Field) {
  if (!attribute.key) return "";
  const label = attribute.formattedValue || attribute.label || attribute.key || "";
  const existLabel = attributesMap.get(attribute.key);
  const existLabels = (existLabel && existLabel.split("; ")) || [];

  if (existLabels.length > 0 && !existLabels.includes(label)) {
    return `${existLabel}; ${label}`;
  }

  if (existLabels.length > 0 && existLabels.includes(label)) {
    return existLabel!;
  }

  return label;
}

export function elementsToAttributesMap(elements: cytoscape.NodeCollection | cytoscape.EdgeCollection): [Map<string, string>, Map<string, MetaField>] {
  const attributeMap: Map<string, string> = new Map();
  const metaAttributeMap: Map<string, MetaField> = new Map();

  elements.forEach((element) => {
    elementToAttributesMap(element.data("payload"), attributeMap, metaAttributeMap);
  });
  return [attributeMap, metaAttributeMap];
}

export function elementToAttributesMap(
  elementData: CyNode["data"]["payload"] | CyEdge["data"]["payload"],
  attributesMap: Map<string, string>,
  metaAttributesMap?: Map<string, MetaField>
) {
  (elementData?.data || []).forEach((entry) => {
    if (entry.key) {
      attributesMap.set(entry.key, getAggregatedAttributeLabel(attributesMap, entry));
    }
    if ((entry.meta_fields?.length || 0) > 0 && metaAttributesMap) {
      entry.meta_fields?.forEach?.((item) => metaAttributesMap.set(`${item.id}`, item));
    }
  });
}

export function formatNode(node: Node, outElements: GraphElements["nodes"], aggr: ElementFormatterAggregation, applyConditionStylesheets?: boolean): CyNode {
  if (!node.guid) {
    console.error("Нет GUID для узла", node);
    throw new Error("Нет GUID для узла");
  }

  if (outElements.has(node.guid)) {
    throw new Error(`Дубликат элемента с GUID ${node.guid}`);
  }

  // @ts-ignore
  if (+node?.styles?.["z-index"] > aggr.maxZindex) {
    // @ts-ignore
    aggr.maxZindex = +node?.styles?.["z-index"];
  }

  // @ts-ignore
  if (+node?.styles?.["z-index"] < aggr.minZindex) {
    // @ts-ignore
    aggr.minZindex = +node?.styles?.["z-index"];
  }

  // @ts-ignore
  if (!node?.styles?.["z-index"]) {
    // @ts-ignore
    _set(node, 'styles["z-index"]', 10000);
  }

  elementToAttributesMap(node, aggr.attributesMap, aggr.metaAttributesMap);

  if (node.system_id) {
    // Кэш всех system_id на графе, используется в фильтрах
    aggr.nodeSystemIds.add(node.system_id);
  }

  const position = node.position as cytoscape.Position;
  const systemIdLabel = node.system_id ? aggr.nodeTypesMap.get(node.system_id)?.label : undefined;

  const formattedNode: CyNode = {
    data: {
      id: node.guid,
      ...(node?.group?.id ? { parent: getCompoundNodeId(node.group.id || 0) } : null),
      label: pickNodeLabel(node.label, node.label_template, node?.data, node.guid),
      subIcons: node.subIcons?.join?.(" ") || "",
      positionX: position.x,
      positionY: position.y,
      system_id: node.system_id,
      ...(systemIdLabel ? { system_id_label: systemIdLabel } : null),
      payload: {
        ...node,
        ...(systemIdLabel ? { system_id_label: systemIdLabel } : null),
      },
    },
    ...(node.position ? { position: node.position as cytoscape.Position } : null),
    classes: "",
  };

  const classes: string[] = Array.isArray(node.classes) ? node.classes : [];

  (node.classes || []).forEach((className) => {
    if (!aggr.stylesheetMap.has(className)) {
      aggr.classesToRequest?.add?.(className);
    }
  });

  if (node.icon) {
    classes.push(getIconClassName(node.icon));
  }

  // if (node.connections_count) {
  //   // отобразить на бейджике количество связей узла
  //   classes.push(CSS_CONNECTIONS_COUNT);
  // }

  if (applyConditionStylesheets) {
    const conditionClasses = getElementDefinitionClassesByConditionStylesheets(aggr.nodeConditionStyles, formattedNode);
    classes.push(...conditionClasses);
  }

  formattedNode.data.className = hashStyle({});
  formattedNode.classes = _uniq(classes).join(" ");

  outElements.set(node.guid, formattedNode);

  return formattedNode;
}

export function formatEdge(edge: Connection, outElements: GraphElements["edges"], aggr: ElementFormatterAggregation, applyConditionStylesheets?: boolean): CyEdge {
  if (!edge.guid) {
    console.error("Нет GUID для связи", edge);
    throw new Error("Нет GUID для связи");
  }

  if (outElements.has(edge.guid)) {
    throw new Error(`Дубликат элемента с GUID ${edge.guid}`);
  }

  elementToAttributesMap(edge, aggr.edgeAttributesMap);

  if (edge.system_id) {
    // Кэш всех system_id на графе, используется в фильтрах
    aggr.edgeSystemIds.add(edge.system_id);
  }

  const systemIdLabel = edge.system_id ? aggr.connectionTypesMap.get(edge.system_id)?.label : undefined;

  const formattedEdge: CyEdge = {
    data: {
      id: edge.guid,
      source: edge.fromGuid,
      target: edge.toGuid,
      label: edge.label || "",
      payload: {
        ...edge,
        ...(systemIdLabel ? { system_id_label: systemIdLabel } : null),
      },
      ...(edge.system_id ? { system_id: edge.system_id } : null),
      ...(systemIdLabel ? { system_id_label: systemIdLabel } : null),
    },
    classes: "",
  };

  const classes: string[] = Array.isArray(edge.classes) ? edge.classes : [];

  (edge.classes || []).forEach((className) => {
    if (!aggr.stylesheetMap.has(className)) {
      aggr.classesToRequest?.add?.(className);
    }
  });

  (edge.classes || []).forEach((className) => {
    if (!aggr.stylesheetMap.has(className)) {
      aggr.classesToRequest?.add?.(className);
    }
  });

  if (applyConditionStylesheets) {
    const conditionClasses = getElementDefinitionClassesByConditionStylesheets(aggr.edgeConditionStyles, formattedEdge);
    classes.push(...conditionClasses);
  }

  formattedEdge.data.className = hashStyle({});
  formattedEdge.classes = _uniq(classes).join(" ");

  outElements.set(edge.guid, formattedEdge);

  return formattedEdge;
}
