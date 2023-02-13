import { CSS_APP_PREFIX } from "../data-layer/cy-constants";
import { timeliteStyles } from "../theme";
import { containerClassName } from "../utils";
import MUIGlobalStyles from "@mui/material/GlobalStyles";
import { useTheme } from "@mui/material/styles";

export interface GlobalStylesProps {}

function GlobalStyles(_props: GlobalStylesProps) {
  const theme = useTheme();

  return (
    <>
      <MUIGlobalStyles
        styles={{
          // Стиль для контейнера, в который монтируется корневой компонент (см. index.tsx -> ReactDOM.render)
          [`.${containerClassName}`]: {
            width: "100%",
            height: "100%",
            overflow: "hidden",
          },
          [`.${CSS_APP_PREFIX}-bg-white`]: {
            // В полноэкранном режиме div виджета оставляет под собой черный фон.
            // Если назначить белый фон для containerClassName, то пропадет карта мира.
            // Назначаем явным образом фон для канвы с картой.
            background: "white",
          },
          // фикс конфликтов со стилями на бою
          label: {
            marginBottom: "0 !important",
          },
          // фикс конфликтов со стилями на бою
          "button:focus": {
            outline: "none !important",
          },
          ".aggregate-title": {
            position: "relative",
            top: "17px",
            fontSize: "12px",
            backgroundColor: "rgba(255,255,255,0.85)",
            borderRadius: "3px",
            paddingLeft: "3px",
            paddingRight: "3px",
            paddingTop: "1px",
            paddingBottom: "1px",
            "& span:first-of-type, & span:nth-of-type(2)": {
              color: theme.palette.primary.main,
            },
            "& span:first-of-type": {
              textTransform: "capitalize",
            },
            "& span:last-child": {},
          },
          ".connections-count-badge": {
            position: "relative",
            backgroundColor: theme.palette.error.main,
            borderRadius: 50,
            padding: "3px",
            fontSize: "11px",
            color: "white",
          },
          ".mapboxgl-control-container": {
            position: "absolute",
            bottom: "0px",
          },
          ".mapboxgl-ctrl-attrib-button": {
            display: "none",
          },

          ".vis-timeline": {
            borderTop: "unset",
          },

          ".vis-item": {
            "&.vis-range": {
              borderRadius: 25,
              "&:not(.vis-selected)": {
                borderColor: theme.palette.primary.light,
                backgroundColor: theme.palette.primary.light,
              },

              "& .vis-item-content": {
                paddingLeft: 10,
              },
            },
            "&.vis-dot": {
              borderColor: theme.palette.primary.light,
            },

            "& .vis-item-overflow": {
              overflow: "visible",
            },
          },
          // Сгенерированные стили для оформления надписей и узлов на таймлайне.
          // Для каждого размера шрифта, каждого начертания, и т.д. сгенерирован свой класс (как в tailwind)
          ...timeliteStyles.stylesheet,
        }}
      />
    </>
  );
}

export default GlobalStyles;
