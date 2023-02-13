import { CSS_APP_PREFIX, CSS_DRAWING, CSS_PREFIX_ICON, CSS_PREFIX_USER_STYLE } from "../data-layer/cy-constants";
import { AggregationFunc, EdgeAggregations, GroupAggregation, StringType, StylesheetDefaults, StylesheetMap } from "../types";
import aveta from "aveta";
// @ts-ignore
import commaNumber from "comma-number";
import moment from "moment";
import sha1 from "sha1";

export const containerClassName = process.env.REACT_APP_ROOT_ELEMENT_ID || "knight-graph-app";

export function fastCloneDeepWithDataLoss<T>(obj: T) {
  return JSON.parse(JSON.stringify(obj)) as T;
}

export async function readFileToString(file: File): Promise<string> {
  const reader = new FileReader();
  return new Promise((resolve, reject) => {
    reader.onload = function (event) {
      const str = event.target?.result || "";

      if (typeof str !== "string") {
        reject("Not a text file");
        return;
      }
      resolve(str);
    };
    reader.onerror = function () {
      reject(reader.error);
    };
    reader.readAsText(file);
  });
}

export async function readFileToBase64(file: File): Promise<string> {
  const reader = new FileReader();
  return new Promise((resolve, reject) => {
    reader.onload = function (event) {
      const str = event.target?.result || "";

      if (typeof str !== "string") {
        reject("File not parsed as base64");
        return;
      }
      resolve(str);
    };
    reader.onerror = function () {
      reject(reader.error);
    };
    reader.readAsDataURL(file);
  });
}

export function downloadJson(filename: string, text: string) {
  var element = document.createElement("a");
  element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(text));
  element.setAttribute("download", filename);

  element.style.display = "none";
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

export function downloadPng(filename: string, content: Blob) {
  var element = document.createElement("a");
  const downloadURL = window.URL.createObjectURL(content);

  element.setAttribute("href", downloadURL);
  element.setAttribute("download", filename);

  element.style.display = "none";
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

export function downloadDocx(filename: string, docxBlob: Blob) {
  var element = document.createElement("a");
  const downloadURL = window.URL.createObjectURL(docxBlob);

  element.setAttribute("href", downloadURL);
  element.setAttribute("download", filename);

  element.style.display = "none";
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

/**
 * {
 *  a: {
 *    b: {
 *      c: [1,2,3]
 *    }
 *  }
 * }
 *
 * to
 *
 * {
 *    'a.b.c.0': 1,
 *    'a.b.c.1': 2,
 *    'a.b.c.2': 3,
 * }
 */
export function flattenObject(ob: any) {
  const toReturn: { [key: string]: any } = {};

  for (var i in ob) {
    if (!ob.hasOwnProperty(i)) continue;

    if (typeof ob[i] == "object" && ob[i] !== null) {
      var flatObject = flattenObject(ob[i]);
      for (var x in flatObject) {
        if (!flatObject.hasOwnProperty(x)) continue;

        toReturn[i + "." + x] = flatObject[x];
      }
    } else {
      toReturn[i] = ob[i];
    }
  }

  return toReturn;
}

/**
 * {
 *    'a.b.c.0': 1,
 *    'a.b.c.1': 2,
 *    'a.b.c.2': 3,
 * }
 *
 * в
 *
 * {
 *  a: {
 *    b: {
 *      c: [1,2,3]
 *    }
 *  }
 * }
 *
 * leftover - ключ:значение куда попадает все, что не имеет префикс namespace.
 *
 * Пример.
 * Сворачиваемый объект
 * {
 *    'node_id': 1,
 *    'edge_id': 2,
 *    'payload.fromGuid': 'abc',
 *    'payload.toGuid': 'bcd'
 * }
 *
 * namespace = 'payload'
 *
 * Функция вернет
 * {
 *  fromGuid: 'abc',
 *  toGuid: 'bcd'
 * }
 *
 * В leftover по ссылке запишется следующее значение
 * {
 *  node_id: 1,
 *  edge_id: 2
 * }
 *
 */
export function unflattenObject<T, R>(data: T | undefined | null, namespace?: string, leftover?: { [key: string]: any }): R {
  const result: any = {};

  if (!data) return result;

  for (let i in data) {
    const keys = i.split(".");
    if (namespace && keys?.[0] !== namespace) {
      if (typeof leftover === "object" && keys?.[0] !== undefined) {
        leftover[keys[0] as string] = data[i];
      }
      continue;
    }
    if (namespace) keys.shift();

    keys.reduce(function (r, e, j) {
      return r[e] || (r[e] = isNaN(Number(keys[j + 1])) ? (keys.length - 1 === j ? data[i] : {}) : []);
    }, result);
  }

  return result;
}

export function isDrawing(element: cytoscape.SingularElementReturnValue | cytoscape.NodeSingular) {
  return element.hasClass(CSS_DRAWING);
}

export function getNodeGroupChildren(node: cytoscape.SingularElementReturnValue | cytoscape.NodeSingular) {
  if (isCollapsedGroup(node)) {
    return node?.data?.()?.collapsedChildren as cytoscape.Collection;
  }
  return node.children();
}

export function isNode(element: cytoscape.SingularElementReturnValue) {
  return element.group() === "nodes" && element.id().indexOf("group") === -1 && element.id().indexOf(CSS_DRAWING) === -1;
}

export function isNodeGroup(element: cytoscape.SingularElementReturnValue | cytoscape.NodeSingular) {
  return element.group() === "nodes" && element.id().indexOf("group") === 0 && element.id().indexOf(CSS_DRAWING) === -1;
}

export function isEdgeGroup(element: cytoscape.SingularElementReturnValue) {
  return element.group() === "edges" && element.data("collapsedEdges") !== undefined;
}

export function isEdge(element: cytoscape.SingularElementReturnValue) {
  return element.group() === "edges";
}

export function isCollapsedGroup(node: cytoscape.NodeSingular) {
  return node?.data?.()?.collapsedChildren !== undefined && node?.data?.()?.collapsedChildren !== null;
}

export function isExpandedGroup(node: cytoscape.NodeSingular) {
  return node?.isParent();
}

export function omitPrefix(flatObject: any, prefix: string, separator: string = ".") {
  const obj: { [key: string]: any } = {};

  for (let key in flatObject) {
    if (key.indexOf(`${prefix}${separator}`) === -1) obj[key] = flatObject[key];
  }

  return obj;
}

export const formatVariantToStringType: { [key: number]: StringType } = {
  1: "date",
  2: "date",
  3: "date",
  4: "number",
  5: "number",
  6: "number",
  7: "number",
  8: "number",
  9: "number",
  10: "number",
};

export function getNubmerFormatVariants() {
  return Object.keys(formatVariantToStringType).filter((variant) => formatVariantToStringType[+variant] === "number");
}

export function getStringType(string: string): StringType {
  if (string !== "" && string?.toString?.().replaceAll?.(/[\d.,]/g, "") === "") return "number";
  if (!isNaN(Date.parse(string))) return "date";
  return "string";
}

export function formatString(string: string, formatVariant: number): string {
  if (!string) return "";

  try {
    switch (formatVariant) {
      case 1:
        return moment(string).format("DD-MM-YYYY");
      case 2:
        return moment.parseZone(string).format("DD-MM-YYYY HH:mm:ss");
      case 3:
        return moment(string).format("DD-MM-YYYY HH:mm:ss");
      case 4:
        return aveta(Number(string), {
          units: ["", " тыс.", "млн.", "млрд.", "трлн.", "трлрд."],
          space: true,
        });
      case 5:
        return commaNumber(parseFloat(string).toFixed(2), " ", ".");
      case 6:
        return commaNumber(parseFloat(string).toFixed(3), " ", ".");
      case 7:
        return commaNumber(parseFloat(string).toFixed(4), " ", ".");
      case 8:
        return commaNumber(parseFloat(string).toFixed(5), " ", ".");
      case 9:
        return commaNumber(parseFloat(string).toFixed(6), " ", ".");
      case 10:
        return commaNumber(parseFloat(string).toFixed(7), " ", ".");
      case 11:
        return commaNumber(parseFloat(string).toFixed(0), " ", ".");
    }
  } catch {
    return string;
  }
  return string;
}

export function validateNum(value: string, allowNegative?: boolean, onlyPositiveInteger?: boolean) {
  if (onlyPositiveInteger) {
    if (!value.match(/^\d{1,}$/gi)) {
      return false;
    }

    return true;
  }

  if (allowNegative && value && !value.match(/^-?(\d{1,}[.]{0,1})[0-9]{0,}$/gi)) {
    return false;
  }

  if (!allowNegative && value && !value.match(/^(\d{1,}[.]{0,1})[0-9]{0,}$/gi)) {
    return false;
  }

  return true;
}

export const numberFormatVariantToTitle: { [key: number]: string } = {
  4: "100 / 1 тыс. / 1 млн. / 1 млрд.",
  5: "100 000.00",
  6: "100 000.{3}",
  7: "100 000.{4}",
  8: "100 000.{5}",
  9: "100 000.{6}",
  10: "100 000.{7}",
};

export const dateFormatVariantToTitle: { [key: number]: string } = {
  1: "DD-MM-YYYY",
  2: "DD-MM-YYYY HH:mm:ss",
  3: "DD-MM-YYYY HH:mm:ss (локальный часовой пояс)",
};

export const aggregationFunctions: AggregationFunc[] = [
  { title: "сумма", key: "sum" },
  { title: "минимум", key: "min" },
  { title: "максимум", key: "max" },
  { title: "среднее", key: "avg" },
];

const aggregationFunctionTitles: Record<string, string> = {};
aggregationFunctions.forEach((item) => (aggregationFunctionTitles[item.key] = item.title));

export { aggregationFunctionTitles };

export function edgeGuid(sourceNode: cytoscape.NodeSingular, targetNode: cytoscape.NodeSingular) {
  return sha1(`${sourceNode.data("payload").system_id}:${sourceNode.data("payload").item_id}|${targetNode.data("payload").system_id}:${targetNode.data("payload").item_id}`);
}

export function nodeGuid(systemId: string, itemId: string) {
  return sha1(`${systemId}:${itemId}`);
}

export function edgeAggregationsToGroupAggregations(
  edgeAggregations: EdgeAggregations | undefined,
  sourceGroupAggregations: GroupAggregation[] | undefined,
  targetGroupAggregations: GroupAggregation[] | undefined
) {
  const groupAggregations: GroupAggregation[] = [];

  (edgeAggregations?.sourceGroupAggregationIndecies as number[])?.forEach((aggregationIndex) => {
    const sourceGroupAggregation = sourceGroupAggregations?.[aggregationIndex] as GroupAggregation;
    if (sourceGroupAggregation && sourceGroupAggregation?.func) groupAggregations.push(sourceGroupAggregation);
  });

  (edgeAggregations?.targetGroupAggregationIndecies as number[])?.forEach((aggregationIndex) => {
    const targetGroupAggregation = targetGroupAggregations?.[aggregationIndex] as GroupAggregation;
    if (targetGroupAggregation && targetGroupAggregation?.func) groupAggregations.push(targetGroupAggregation);
  });

  return groupAggregations;
}

export function edgeToGroupAggregations(edge: cytoscape.EdgeSingular): GroupAggregation[] {
  return edgeAggregationsToGroupAggregations(edge.data("payload")?.aggregations, edge.source().data("payload")?.aggregations, edge.target().data("payload")?.aggregations);
}

export function edgeToEdgeGroupAggregations(edge: cytoscape.EdgeSingular): GroupAggregation[] {
  return edge.data("payload")?.aggregations || [];
}

export function groupAggregationsToLabel(groupAggregations: GroupAggregation[] | undefined): string {
  return (groupAggregations || []).reduce((str, item, index) => `${index > 0 ? `${str} | ${groupAggregationToLabel(item)}` : groupAggregationToLabel(item)}`, "");
}

export function groupAggregationToLabel(item: GroupAggregation) {
  return `${aggregationFunctionTitles[item?.func || ""] || item.func || "[функция]"} ${item.fieldLabel || item.field || "[поле]"}: ${item.formattedValue || item.result || "0"}`;
}

export function removeLeadingDot(str: string) {
  return str[0] === "." ? str.substring(1, str.length) : str;
}

// Вернут true если css класс является служебным внутри приложения (например класс, отображающий бейдж количества связей),
// false - если класс пришел с бэка или был сгенерирован фильтром условного форматирования (см. node-styles-settings.tsx, edge-styles-settings.tsx)
export function isAppClassName(className: string) {
  return className.substring(0, CSS_APP_PREFIX.length) === CSS_APP_PREFIX;
}

// true, если класс сгенерирован пользователем после изменения элемента через "карандашик"
export function isUserClassName(className: string) {
  return className.substring(0, CSS_PREFIX_USER_STYLE.length) === CSS_PREFIX_USER_STYLE;
}

export function isIconClassName(className: string) {
  return className.substring(0, CSS_PREFIX_ICON.length) === CSS_PREFIX_ICON;
}

// Вернет все стили, которые должны уйти в экспортируемый json.
export function filterAppStyles(stylesheetMap: StylesheetMap, stylesheetDefaults: StylesheetDefaults) {
  const stylesheets: cytoscape.StylesheetStyle[] = [];

  stylesheetMap.forEach((stylesheet) => {
    const className = removeLeadingDot(stylesheet.selector);
    if (stylesheetDefaults.defaultStylesheet.some((defaultStylesheet) => defaultStylesheet.selector === stylesheet.selector)) return;
    if (stylesheetDefaults.selectedOverrides.some((selectedOverride) => selectedOverride.selector === stylesheet.selector)) return;
    if (isAppClassName(className) && !isUserClassName(className)) return;

    stylesheets.push(stylesheet);
  });

  return stylesheets;
}

export function getCompiledStyles(element: cytoscape.SingularElementArgument, stylesheetMap: StylesheetMap | undefined) {
  let compiledStyle: cytoscape.Css.Node | cytoscape.Css.Edge = {};

  (element.classes() as unknown as string[]).forEach((className) => {
    if (isIconClassName(className)) return;
    const stylesheet = stylesheetMap?.get?.(`.${className}`);
    if (stylesheet?.style) {
      // @ts-ignore
      compiledStyle = {
        ...compiledStyle,
        ...stylesheet.style,
      };
    }
  });

  // @ts-ignore
  if (element.style("source-arrow-shape") && !compiledStyle["source-arrow-shape"]) {
    // @ts-ignore
    compiledStyle["source-arrow-shape"] = element.style("source-arrow-shape");
  }

  // @ts-ignore
  if (element.style("target-arrow-shape") && !compiledStyle["target-arrow-shape"]) {
    // @ts-ignore
    compiledStyle["target-arrow-shape"] = element.style("target-arrow-shape");
  }

  // @ts-ignore
  if (!compiledStyle["source-arrow-color"]) {
    // @ts-ignore
    compiledStyle["source-arrow-color"] = compiledStyle["line-color"];
  }

  // @ts-ignore
  if (!compiledStyle["target-arrow-color"]) {
    // @ts-ignore
    compiledStyle["target-arrow-color"] = compiledStyle["line-color"];
  }

  return compiledStyle;
}

export function isFullscreen() {
  return !!documentFullscreenElement();
}

// https://www.w3schools.com/howto/howto_js_fullscreen.asp
export function openFullscreen(elem: HTMLElement) {
  if (elem.requestFullscreen) {
    elem.requestFullscreen();
    // @ts-expect-error
  } else if (elem.webkitRequestFullscreen) {
    /* Safari */
    // @ts-expect-error
    elem.webkitRequestFullscreen();
    // @ts-expect-error
  } else if (elem.msRequestFullscreen) {
    /* IE11 */
    // @ts-expect-error
    elem.msRequestFullscreen();
  }
}

export function closeFullscreen() {
  if (document.exitFullscreen) {
    document.exitFullscreen();
    // @ts-expect-error
  } else if (document.webkitExitFullscreen) {
    /* Safari */
    // @ts-expect-error
    document.webkitExitFullscreen();
    // @ts-expect-error
  } else if (document.msExitFullscreen) {
    /* IE11 */
    // @ts-expect-error
    document.msExitFullscreen();
  }
}

export function documentFullscreenElement() {
  const fullscreenElement =
    document.fullscreenElement /* Standard syntax */ ||
    // @ts-expect-error
    document.webkitFullscreenElement /* Chrome, Safari and Opera syntax */ ||
    // @ts-expect-error
    document.mozFullScreenElement /* Firefox syntax */ ||
    // @ts-expect-error
    document.msFullscreenElement; /* IE/Edge syntax */

  return fullscreenElement as typeof document.fullscreenElement;
}

export const fullscreenEventListenerEvents = ["", "moz", "webkit", "ms"].map((item) => `${item}fullscreenchange`);

export async function base64SvgToPng(base64: string, width: number, height: number) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d")!;

  const buffer = await new Promise<ArrayBuffer>((resolve) => {
    let image = new Image();

    image.onload = () => {
      context.drawImage(image, 0, 0, width, height);

      canvas.toBlob((blob) => {
        resolve(blob!.arrayBuffer());
      }, "image/png");
    };

    image.src = base64;
  });

  return buffer;
}
