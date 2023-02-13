import EventIcon from "@mui/icons-material/Event";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
// import Popover from "@mui/material/Popover";
import { Popover } from "./popover";
import moment from "moment";
import { useRef } from "react";
import { DateRange as ReactDateRangePicker, DateRangeProps as ReactDateRangePickerProps } from "react-date-range";
// @ts-ignore
import * as locales from "react-date-range/dist/locale";

export interface DateRangePickerProps {
  isOpen: boolean;
  startDate?: Date;
  endDate?: Date;
  onClose: () => void;
  onOpen: () => void;
  onChange: ReactDateRangePickerProps["onChange"];
}

export default function DateRangePicker(props: DateRangePickerProps) {
  const anchorElRef = useRef<HTMLDivElement | null>(null);

  const value = `${props.startDate ? `${moment(props.startDate).format("DD-MM-yyyy")} / ` : ""}${props.endDate ? moment(props.endDate).format("DD-MM-yyyy") : ""}`;

  return (
    <Box>
      <TextField
        size="small"
        value={value}
        InputProps={{
          endAdornment: (
            <Box ref={anchorElRef}>
              <IconButton onClick={props.onOpen} size="small">
                <EventIcon fontSize="small" />
              </IconButton>
            </Box>
          ),
        }}
      />
      <Popover
        onClose={props.onClose}
        open={props.isOpen}
        anchorEl={anchorElRef.current}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: -10, horizontal: "left" }}
      >
        <ClickAwayListener onClickAway={props.onClose}>
          <Paper elevation={0} sx={{ p: 2, flexDirection: "column", display: "flex" }}>
            <Grid container spacing={2}>
              <Grid item xs={12} justifyContent="space-between" alignItems="center" display="flex">
                <Typography>Диапазон дат</Typography>
                <IconButton size="small" onClick={props.onClose}>
                  <CloseOutlinedIcon fontSize="small" />
                </IconButton>
              </Grid>
            </Grid>

            <ReactDateRangePicker
              ranges={[
                {
                  startDate: props.startDate,
                  endDate: props.endDate,
                  key: "selection",
                },
              ]}
              onChange={props.onChange}
              locale={locales["ru"]}
              startDatePlaceholder="Начало"
              endDatePlaceholder="Конец"
            />
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Button
                  fullWidth
                  onClick={() => {
                    props?.onChange?.({
                      selection: {
                        startDate: undefined,
                        endDate: props.endDate || new Date(),
                      },
                    });
                  }}
                  variant="outlined"
                  sx={{ mt: 1 }}
                >
                  До
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button
                  fullWidth
                  onClick={() => {
                    props?.onChange?.({
                      selection: {
                        startDate: props.startDate || new Date(),
                        endDate: undefined,
                      },
                    });
                  }}
                  variant="outlined"
                  sx={{ mt: 1 }}
                >
                  После
                </Button>
              </Grid>
            </Grid>

            <Button
              onClick={() => {
                props?.onChange?.({
                  selection: {
                    startDate: undefined,
                    endDate: undefined,
                  },
                });
              }}
              variant="outlined"
              sx={{ mt: 1 }}
            >
              Очистить
            </Button>
          </Paper>
        </ClickAwayListener>
      </Popover>
    </Box>
  );
}
