import VisibilityOffTwoToneIcon from "@mui/icons-material/VisibilityOffTwoTone";
import VisibilityTwoToneIcon from "@mui/icons-material/VisibilityTwoTone";
import Checkbox from "@mui/material/Checkbox";
import Tooltip from "@mui/material/Tooltip";

export interface ToggleTransparentCheckboxProps {
  onChange: () => void;
  checked: boolean;
}

export function ToggleTransparentCheckbox(props: ToggleTransparentCheckboxProps) {
  return (
    <Tooltip title={props.checked ? "Показать" : "Сделать прозрачным"}>
      <Checkbox icon={<VisibilityTwoToneIcon />} checkedIcon={<VisibilityOffTwoToneIcon />} checked={props.checked} size="small" onChange={props.onChange} />
    </Tooltip>
  );
}
