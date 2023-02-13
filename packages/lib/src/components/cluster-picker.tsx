import { ClusterAlgo, ClusterFieldVariant, GraphState, OnClusterSetupChange } from "../types";
import { validateNum } from "../utils";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import InputLabel from "@mui/material/InputLabel";
import Link from "@mui/material/Link";
import ListItemText from "@mui/material/ListItemText";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useMemo, useState } from "react";

export interface ClusterPickerProps {
  attributesMap: GraphState["attributesMap"];
  nodeSystemIds: GraphState["nodeSystemIds"];

  onChange: OnClusterSetupChange;

  onClose?: () => void;
  onSelectOpen?: () => void;
  onSelectClose?: () => void;
}

const algos = {
  kMeans: { key: "kMeans", label: "Кластеризация К-средних (k-means)", description: "Центроидами K кластеров будут приняты средневзвешенные значения параметра." },
  kMedoids: { key: "kMedoids", label: "Кластеризация К-метоид (k-medoids)", description: "Центроидами K кластеров будут приняты средние ноды по значениям параметра." },
  fuzzyCMeans: {
    key: "fuzzyCMeans",
    label: "Нечеткая кластеризация C-средних (fuzzy c-means)",
    description: "При расстановке будет оценена вероятность принадлежности к нескольким кластерам.",
  },
  hierarchicalClustering: {
    key: "hierarchicalClustering",
    label: "Иерархическая кластеризация (hierarchical clustering)",
    description: "Кластеризация с расстановкой по топологии графа",
  },
  affinityPropagation: {
    key: "affinityPropagation",
    label: "Кластеризация распространения сходства",
    description: "Количество кластеров будет определено автоматически, а их центроидами будут приняты средние ноды по значениям параметра.",
  },
};

export default function ClusterPicker(props: ClusterPickerProps) {
  const [pickedNodeAttribute, setPickedNodeAttribute] = useState("");

  const [option, setOption] = useState<ClusterFieldVariant>("system_id");
  const [clusterAlgo, setClusterAlgo] = useState<ClusterAlgo>("kMeans");
  const [k, setK] = useState<number | undefined>(2);

  const isKAlgo = ["kMeans", "kMedoids"].includes(clusterAlgo);

  const isSubmitDisable = (option === "attribute" && !pickedNodeAttribute) || (isKAlgo && (!k || k < 1 || (clusterAlgo === "kMedoids" && k > 24)));

  return (
    <Paper sx={{ p: 2, width: "400px" }}>
      <Grid item xs={12} justifyContent="space-between" alignItems="center" display="flex">
        <Typography>Кластер</Typography>
        <IconButton size="small" onClick={props.onClose}>
          <CloseOutlinedIcon fontSize="small" />
        </IconButton>
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Divider sx={{ mt: 1, mb: 1 }} />
          <FormControl fullWidth>
            <RadioGroup>
              <FormControlLabel
                control={
                  <Radio
                    checked={option === "system_id"}
                    size="small"
                    onClick={() => {
                      setOption("system_id");
                    }}
                  />
                }
                label="тип узла (system_id)"
              />
              <FormControlLabel
                control={
                  <Radio
                    checked={option === "attribute"}
                    size="small"
                    onClick={() => {
                      setOption("attribute");
                    }}
                  />
                }
                label="атрибут"
              />

              <FormControl fullWidth>
                <Select
                  disabled={option !== "attribute"}
                  value={pickedNodeAttribute}
                  onChange={(event) => {
                    setPickedNodeAttribute(event.target.value);
                  }}
                  size="small"
                  onOpen={props.onSelectOpen}
                  onClose={props.onSelectClose}
                >
                  {Array.from(props.attributesMap.keys()).map((attributeKey) => (
                    <MenuItem key={attributeKey} value={attributeKey}>
                      <ListItemText primary={props.attributesMap.get(attributeKey)} secondary={attributeKey} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </RadioGroup>
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <Divider sx={{ mb: 2 }} />

          <FormControl fullWidth>
            <InputLabel sx={{ "&:not(.Mui-focused):not(.MuiInputLabel-shrink)": { top: "-7px" } }}>алгоритм</InputLabel>
            <Select
              value={clusterAlgo}
              onChange={(event) => {
                setClusterAlgo(event.target.value as ClusterAlgo);
              }}
              size="small"
              onOpen={props.onSelectOpen}
              onClose={props.onSelectClose}
              label="алгоритм"
            >
              {Object.entries(algos).map((algo) => (
                <MenuItem key={algo[0]} value={algo[0]}>
                  <Typography>{algo[1].label}</Typography>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {isKAlgo ? (
            <Box sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Количество кластеров (К)"
                placeholder="Количество кластеров (К)"
                size="small"
                value={k === undefined ? "" : k}
                onChange={(event) => {
                  const value = event.target.value;
                  if (!validateNum(value, false, true) && value) return;

                  setK(+value || undefined);
                }}
              />
            </Box>
          ) : null}
        </Grid>

        <Grid item xs={12}>
          <Typography variant="body2" color="grey.600">
            {algos?.[clusterAlgo]?.description}
          </Typography>
        </Grid>

        <Grid item xs={12}>
          <Stack direction="row" spacing={2} alignItems="flex-end" justifyContent="space-between">
            <Button
              variant="contained"
              disabled={isSubmitDisable}
              onClick={() => {
                props.onChange({
                  clusterFieldVariant: option,
                  ...(option === "attribute" ? { attributeKey: pickedNodeAttribute } : null),
                  algo: clusterAlgo,
                  ...(isKAlgo ? { algoOptions: { k } } : null),
                });
              }}
            >
              Применить
            </Button>
          </Stack>
        </Grid>
      </Grid>
    </Paper>
  );
}
