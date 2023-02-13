import { CSS_FLASH } from "../../cy-constants";
import { getHiddenNode, noUserClasses, refreshStylesheet } from "./helpers";
import { getIconClassName, hashStyle } from "../../format-response";
import { CyCallbackAction, OnChangeNodePayload, StylesheetDefaults, UseDispatchCyActionProps } from "../../../types";
import { isIconClassName } from "../../../utils";
import cytoscape from "cytoscape";
import _omitBy from "lodash/omitBy";
import _set from "lodash/set";

export function changeNodeAction(cy: cytoscape.Core, action: CyCallbackAction, props: UseDispatchCyActionProps, stylesheetDefaults: StylesheetDefaults) {
  if (action.type !== "CHANGE_NODE") return;
  const expandCollapse = cy.expandCollapse("get");

  const elementGuid = action.payload.nodeGuid;

  const element = getHiddenNode(props, elementGuid) || cy.$id(elementGuid);
  let elements: cytoscape.CollectionReturnValue = element;

  const isBatch =
    action.payload.data.isApplyStyleToAllNodesWithSameSystemId ||
    action.payload.data.isApplyLabelToAllNodesWithSameSystemId ||
    action.payload.data.isApplyIconToAllNodesWithSameSystemId ||
    action.payload.data.isApplySubIconsToAllNodesWithSameSystemId;

  cy.batch(() => {
    if (isBatch) {
      // Применяем изменения ко всем элементам с таким же system_id
      const selector = `[system_id = '${element.data("system_id")}']`;
      elements = cy.$(selector);

      const collapsedGroups = expandCollapse.expandableNodes();
      (Array.from(collapsedGroups) as cytoscape.SingularElementReturnValue[]).forEach((item) => {
        // Выбираем элементы из свернутых групп
        const collapsedChildren = item.data().collapsedChildren as cytoscape.NodeCollection;
        const collapsedChildrenWithSameSystemId = collapsedChildren.nodes(selector);
        elements.merge(collapsedChildrenWithSameSystemId);
      });
    }

    // Если значение свойства пустое, выкидываем его из таблицы стилей
    const newStyle = _omitBy(action.payload.data.style, (item) => item === undefined || item === null || item === "");
    const newUserClassName = hashStyle(newStyle);

    const stylesheetMap = new Map(props.graphState.stylesheetMap);
    const selectedNodesData = new Map(props.graphState.selectedNodes);
    const selectedGroups = new Map(props.graphState.selectedNodeGroups);

    let isSelectedNodesDataDirty = false;
    let isSelectedGroupsDirty = false;
    let isStylesheetDirty = false;

    const originElementId = elementGuid;

    function changeElement(args: {
      element: cytoscape.SingularElementReturnValue;
      doSkipOriginElement: boolean;
      data: OnChangeNodePayload;
      doChangeLabel?: boolean;
      doChangeStyle?: boolean;
      doChangeIcon?: boolean;
      doChangeSubIcons?: boolean;
      doChangeIsFlash?: boolean;
    }) {
      if (args.doSkipOriginElement && args.element.id() === originElementId) return;

      // Меняем каждый выбранный элемент
      const group = expandCollapse.getParent(args.element.id());
      const isExpandable = expandCollapse.isExpandable(group);

      if (isExpandable) expandCollapse.expand(group);

      const newData = args.element.data();

      if (args.doChangeLabel) {
        // Меняем подпись
        _set(newData, "payload.label_template", args.data.labelTemplate);
      }

      if (args.doChangeSubIcons) {
        // Меняем суб-иконку
        const newSubIcons = args.data.subIcons || [];

        _set(newData, "payload.subIcons", newSubIcons);
        _set(newData, "subIcons", newSubIcons.join(" "));
      }

      if (args.doChangeIcon) {
        // Меняем иконку
        // Стили иконок генерируются на момент загрузки графа, см. format-response.ts -> addIconsToStylesheet
        _set(newData, "payload.icon", args.data.iconKey);
        const noIconClasses = (args.element.classes() as unknown as string[]).filter((className) => !isIconClassName(className));
        args.element.classes([...noIconClasses, getIconClassName(args.data.iconKey || "")]);
      }

      if (args.doChangeStyle && newStyle !== undefined && !args.element.hasClass(newUserClassName)) {
        // Обновляем стиль

        for (const styleKey of Object.keys(newStyle)) {
          // Проходим по всем полям в новых стилях, устанавливаем их в data поля элемента
          // и назначаем элементу новый класс
          const key = styleKey as keyof cytoscape.Css.Node;
          const style = newStyle as cytoscape.Css.Node;
          _set(newData, `payload.styles.${styleKey}`, style[key]);
        }

        args.element.classes([...noUserClasses(args.element), newUserClassName]);
        _set(newData, "className", newUserClassName);
      }

      if (args.doChangeIsFlash) {
        if (args.data.isFlash) {
          args.element.scratch("_app", {
            flashHandler: setInterval(() => {
              args.element.flashClass(CSS_FLASH, 1000);
            }, 2000),
          });
        }
        if (!args.data.isFlash) {
          clearInterval(args.element.scratch("_app")?.flashHandler);
        }
      }

      args.element.data(newData);

      if (selectedNodesData.has(args.element.id())) {
        // Обновляем сайдбар (узлы)
        selectedNodesData.set(args.element.id(), args.element);
        isSelectedNodesDataDirty = true;
      }

      if (selectedGroups.has(group.id())) {
        // Обновляем сайдбар (группы)
        selectedGroups.set(group.id(), group);
        isSelectedGroupsDirty = true;
      }

      const selector = `.${newUserClassName}`;
      if (!stylesheetMap.has(selector) && newStyle) {
        // Создаем стиль в таблице стилей если такой стиль новый
        stylesheetMap.set(selector, { selector: selector, style: newStyle });
        isStylesheetDirty = true;
      }

      if (isExpandable) expandCollapse.collapse(group);
    }

    changeElement({
      element,
      data: action.payload.data,
      doChangeLabel: true,
      doChangeStyle: true,
      doChangeIcon: true,
      doChangeSubIcons: true,
      doSkipOriginElement: false,
      doChangeIsFlash: action.payload.data.isFlash !== undefined,
    });

    elements.forEach((element) => {
      changeElement({
        element,
        data: action.payload.data,
        doChangeLabel: action.payload.data.isApplyLabelToAllNodesWithSameSystemId,
        doChangeStyle: action.payload.data.isApplyStyleToAllNodesWithSameSystemId,
        doChangeIcon: action.payload.data.isApplyIconToAllNodesWithSameSystemId,
        doChangeSubIcons: action.payload.data.isApplySubIconsToAllNodesWithSameSystemId,
        doSkipOriginElement: true,
      });
    });

    if (isSelectedNodesDataDirty || isSelectedGroupsDirty) {
      props.dispatchGraphAction({
        type: "SET_SELECTED_ELEMENTS",
        payload: {
          ...(isSelectedNodesDataDirty ? { selectedNodes: selectedNodesData } : null),
          ...(isSelectedGroupsDirty ? { selectedNodeGroups: selectedGroups } : null),
        },
      });
    }

    if (isStylesheetDirty) {
      props.dispatchGraphAction({ type: "SET_STYLESHEET_MAP", payload: stylesheetMap });
      refreshStylesheet(props, stylesheetDefaults, stylesheetMap);
    }
  });
}
