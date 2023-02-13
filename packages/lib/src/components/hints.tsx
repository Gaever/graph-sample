import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";

export interface HintsProps {}

function Hotkey(props: { symbol: string; macSymbol?: string; descrition: string }) {
  const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;

  return (
    <>
      <Grid item xs={10}>
        <Typography variant="body2" sx={{ color: "grey.700", pr: 0.5 }}>
          {props.descrition}
        </Typography>
      </Grid>
      <Grid item xs={2}>
        <Typography
          variant="body2"
          sx={{
            textAlign: "right",
            verticalAlign: "center",
            fontWeight: "bold",
            color: "grey.700",
          }}
        >
          {(isMac && props.macSymbol) || props.symbol}
        </Typography>
      </Grid>
    </>
  );
}

const Hints: React.FunctionComponent<HintsProps> = () => {
  return (
    <Paper variant="outlined" sx={{ m: 2, mb: 3, p: 3 }}>
      <Typography>Выберите один или несколько элементов (нажав shift и растянув рамку выделения) чтобы посмотреть данные.</Typography>
      <Grid container sx={{ mt: 1 }} alignItems="center" spacing={1}>
        <Hotkey symbol="Ctrl+A" macSymbol="⌘A" descrition="выбрать все узлы и связи" />
        <Hotkey symbol="Del" macSymbol="⌫" descrition="удалить выбранные элементы" />
        <Hotkey symbol="G" descrition="группировать выбранные узлы" />
        <Hotkey symbol="X" descrition="свернуть выбранные связи" />
        <Hotkey symbol="C" descrition="создать связь (сначала выбрать узел)" />
        <Hotkey symbol="B" descrition="открыть/закрыть боковую панель" />
      </Grid>
    </Paper>
  );
};

export default Hints;
