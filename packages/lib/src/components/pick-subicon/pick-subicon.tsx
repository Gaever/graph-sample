import AddIcon from "@mui/icons-material/Add";
import { Typography } from "@mui/material";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import { FixedSizeList, ListChildComponentProps } from "react-window";
import { ffFontAwesome } from "../../theme";
import fontAwesomeIcons from "./font-awesome-icons.json";

export interface PickSubiconProps {
  picked: string[];
  onIconClick: (icon: string) => void;
}

const iconsPerRow = 9;
const rows = Math.ceil(fontAwesomeIcons.length / iconsPerRow);

interface renderRowProps extends ListChildComponentProps, PickSubiconProps {}

function IconItem(props: { isPicked: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <Box
      sx={{
        width: "25px",
        height: "25px",
        m: "1px",
        borderWidth: 1,
        borderColor: "grey.400",
        borderStyle: "solid",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "4px",
        cursor: "pointer",
        transition: (theme) => theme.transitions.create(["box-shadow", "background-color", "border-color", "color"]),
        "&:hover": {
          backgroundColor: "grey.300",
          borderColor: "grey.300",

          ...(props.isPicked
            ? {
                color: "white",
                backgroundColor: "black",
                borderColor: "black",
              }
            : null),
        },

        ...(props.isPicked
          ? {
              color: "white",
              backgroundColor: "grey.800",
              borderColor: "grey.800",
            }
          : null),
      }}
      onClick={props.onClick}
    >
      <Typography sx={{ fontFamily: ffFontAwesome }}>{props.children}</Typography>
    </Box>
  );
}

function renderRow(props: renderRowProps) {
  const { index: rowIndex, style } = props;

  return (
    <Box style={style} sx={{ flex: 1, display: "flex" }} key={rowIndex}>
      {Array.from(Array(iconsPerRow).keys()).map((index) => {
        const icon = fontAwesomeIcons[rowIndex * iconsPerRow + index];
        const isPicked = props.picked.includes(icon);

        if (!icon) return null;

        return (
          <IconItem
            key={`${rowIndex}-${index}-${icon}`}
            onClick={() => {
              props.onIconClick(icon);
            }}
            isPicked={isPicked}
          >
            {icon}
          </IconItem>
        );
      })}
    </Box>
  );
}

export interface PickedSubiconsProps extends PickSubiconProps {
  onAddClick: () => void;
}

export function PickedSubicons(props: PickedSubiconsProps) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column" }}>
      <Box sx={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}>
        {props.picked.map((icon) => (
          <Box key={icon}>
            <IconItem
              onClick={() => {
                props.onIconClick(icon);
              }}
              isPicked
            >
              {icon}
            </IconItem>
          </Box>
        ))}
        <IconButton onClick={props.onAddClick} size="small">
          <AddIcon fontSize="small" />
        </IconButton>
      </Box>
    </Box>
  );
}

export default function PickSubicon(props: PickSubiconProps) {
  return (
    <Box sx={{ width: "260px" }}>
      <FixedSizeList height={81} width="100%" itemSize={27} itemCount={rows} overscanCount={30}>
        {(rowProps: ListChildComponentProps) => renderRow({ ...rowProps, ...props })}
      </FixedSizeList>
    </Box>
  );
}
