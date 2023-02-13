import Box, { BoxProps } from "@mui/material/Box";

export interface NodeIconProps extends BoxProps {
  base64src: string;
  width?: string;
  height?: string;
  removeShadow?: boolean;
}

export default function NodeIcon(props: NodeIconProps) {
  return (
    <Box
      onClick={props.onClick}
      sx={{
        backgroundImage: `url(${props.base64src})`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center center",
        width: props.width || "50px",
        height: props.height || "50px",
        backgroundSize: "contain",
        transition: (theme) => theme.transitions.create(["filter"]),
        ...(props.removeShadow
          ? null
          : {
              "&:hover, &:active": {
                cursor: "pointer",
                filter: "drop-shadow( 0px 1px 2px rgba(0, 0, 0, 0.5))",
              },
            }),
      }}
    />
  );
}
