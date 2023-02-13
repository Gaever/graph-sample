import FlashlightOffOutlinedIcon from "@mui/icons-material/FlashlightOffOutlined";
import FlashlightOnOutlinedIcon from "@mui/icons-material/FlashlightOnOutlined";
import Checkbox from "@mui/material/Checkbox";
import Tooltip from "@mui/material/Tooltip";

export interface ToggleFlashCheckboxProps {
  onChange: () => void;
  checked: boolean;
}

export function ToggleFlashCheckbox(props: ToggleFlashCheckboxProps) {
  return (
    <Tooltip title={props.checked ? "Остановить анимацию" : "Анимировать"}>
      <Checkbox icon={<FlashlightOnOutlinedIcon />} checkedIcon={<FlashlightOffOutlinedIcon />} checked={props.checked} size="small" onChange={props.onChange} />
    </Tooltip>
  );
}
