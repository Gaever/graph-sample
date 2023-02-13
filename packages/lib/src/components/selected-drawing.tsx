import Collapse from "./collapse";
import SidebarPaper from "./sidebar-paper";
import { OnDrawingChange, OnDrawingDelete } from "../types";
import { EditNode } from "./edit-node";

export interface SelectedDrawingProps {
  element: cytoscape.NodeSingular;
  onDelete: OnDrawingDelete;
  onChange: OnDrawingChange;
}

export function SelectedDrawing(props: SelectedDrawingProps) {
  return (
    <SidebarPaper>
      <Collapse
        isOpen={false}
        label={`${props.element.data("label") ? `Рисунок: ${props.element.data("label")}` : "Рисунок"}`}
        ElementActionsProps={{
          onDeleteClick: () => {
            props.onDelete(props.element);
          },
        }}
        ListItemTextProps={{ primaryTypographyProps: { variant: "body1" } }}
        ListItemButtonProps={{ sx: { p: 1.5, pb: 1 } }}
      >
        <EditNode
          style={props.element.data("style") || {}}
          nodeData={props.element.data()}
          onChange={(data) => {
            props.onChange(props.element, data.style || {}, data.labelTemplate);
          }}
          displayedOptions={[
            "label-template-edit",
            "font-family-select",
            "font-size-select",
            "font-style-picker",
            "shape",
            "transparent-checkbox",
            "node-size-and-color",
            "submit",
          ]}
          PaperProps={{
            sx: {
              boxShadow: "none",
              width: "auto",
              p: 2,
            },
          }}
          LabelTemplateTextFieldProps={{
            TextFieldProps: {
              label: "Подпись",
              InputProps: {},
            },
          }}
        />
      </Collapse>
    </SidebarPaper>
  );
}
