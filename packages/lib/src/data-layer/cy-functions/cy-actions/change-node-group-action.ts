import { CSS_COMPOUND_HIDE_ICON } from "../../cy-constants";
import { noUserClasses, refreshStylesheet } from "./helpers";
import { getIconClassName, hashStyle } from "../../format-response";
import { CyCallbackAction, OnChangeNodeGroupPayload, StylesheetDefaults, UseDispatchCyActionProps } from "../../../types";
import { isIconClassName } from "../../../utils";
import cytoscape from "cytoscape";
import _omitBy from "lodash/omitBy";
import _set from "lodash/set";

export function changeNodeGroupAction(cy: cytoscape.Core, action: CyCallbackAction, props: UseDispatchCyActionProps, stylesheetDefaults: StylesheetDefaults) {
  if (action.type !== "CHANGE_NODE_GROUP") return;

  cy.batch(() => {
    const { label } = action.payload.data;
    const groupId = action.payload.groupId;

    const expandCollapse = cy.expandCollapse("get");

    const element = cy.$id(groupId);
    let elements: cytoscape.CollectionReturnValue = element;

    const isBatch = action.payload.data.isApplyStyleToAllGroups || action.payload.data.isApplyIconToAllGroups;

    cy.batch(() => {
      if (isBatch) {
        const c = cy.collection();
        c.merge(expandCollapse.expandableNodes());
        c.merge(expandCollapse.collapsibleNodes());
        elements = c;
      }

      const newStyle = _omitBy(action.payload.data.style, (item) => item === undefined || item === null || item === "");
      const newUserClassName = hashStyle(newStyle);

      const stylesheetMap = new Map(props.graphState.stylesheetMap);
      const selectedGroups = new Map(props.graphState.selectedNodeGroups);

      let isSelectedGroupsDirty = false;
      let isStylesheetDirty = false;

      const originElementId = groupId;

      function changeElement(args: {
        element: cytoscape.SingularElementReturnValue;
        doSkipOriginElement: boolean;
        data: OnChangeNodeGroupPayload;
        doChangeLabel?: boolean;
        doChangeStyle?: boolean;
        doChangeIcon?: boolean;
        doChangeSubIcons?: boolean;
      }) {
        if (args.doSkipOriginElement && args.element.id() === originElementId) return;

        const newData = args.element.data();

        if (args.doChangeLabel) {
          // Меняем подпись
          _set(newData, "label", args.data.label);
        }

        if (args.doChangeSubIcons) {
          // Меняем суб-иконку
          const newSubIcons = args.data.subIcons || [];

          _set(newData, "payload.subIcons", newSubIcons);
          _set(newData, "subIcons", newSubIcons.join(" "));
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

        if (args.doChangeIcon) {
          // Меняем иконку
          // Стили иконок генерируются на момент загрузки графа, см. format-response.ts -> addIconsToStylesheet
          _set(newData, "payload.icon", args.data.iconKey);
          const noIconClasses = (args.element.classes() as unknown as string[]).filter((className) => !isIconClassName(className) && className !== CSS_COMPOUND_HIDE_ICON);
          args.element.classes([...noIconClasses, getIconClassName(args.data.iconKey || "")]);
        }

        args.element.data(newData);
        args.element.addClass(CSS_COMPOUND_HIDE_ICON);

        if (selectedGroups.has(args.element.id())) {
          // Обновляем сайдбар (группы)
          selectedGroups.set(args.element.id(), args.element);
          isSelectedGroupsDirty = true;
        }

        const selector = `.${newUserClassName}`;
        if (!stylesheetMap.has(selector) && newStyle) {
          // Создаем стиль в таблице стилей если такой стиль новый
          stylesheetMap.set(selector, { selector, style: newStyle });
          isStylesheetDirty = true;
        }
      }

      changeElement({
        element,
        data: action.payload.data,
        doChangeLabel: true,
        doChangeStyle: true,
        doChangeIcon: true,
        doChangeSubIcons: false,
        doSkipOriginElement: false,
      });

      elements.forEach((element) => {
        changeElement({
          element,
          data: action.payload.data,
          doChangeLabel: false,
          doChangeStyle: action.payload.data.isApplyStyleToAllGroups,
          doChangeIcon: action.payload.data.isApplyIconToAllGroups,
          doChangeSubIcons: false,
          doSkipOriginElement: true,
        });
      });

      if (isSelectedGroupsDirty) {
        props.dispatchGraphAction({
          type: "SET_SELECTED_ELEMENTS",
          payload: {
            ...(isSelectedGroupsDirty ? { selectedNodeGroups: selectedGroups } : null),
          },
        });
      }

      if (isStylesheetDirty) {
        props.dispatchGraphAction({ type: "SET_STYLESHEET_MAP", payload: stylesheetMap });
        refreshStylesheet(props, stylesheetDefaults, stylesheetMap);
      }
    });

    if (label) {
      const element = cy.$id(groupId);
      const newData = element.data();
      _set(newData, "label", label);
      _set(newData, "payload.label", label);

      element.data(newData);

      const selectedGroups = new Map(props.graphState.selectedNodeGroups);
      selectedGroups.set(groupId, element);
      props.dispatchGraphAction({ type: "SET_SELECTED_ELEMENTS", payload: { selectedNodeGroups: selectedGroups } });
    }
  });
}
