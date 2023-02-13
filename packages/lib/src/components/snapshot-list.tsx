import SidebarPaper from "./sidebar-paper";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText, { ListItemTextProps } from "@mui/material/ListItemText";
import Collapse from "./collapse";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";

import { SnapshotGeneralInfo } from "../http/api";

export interface SnapshotListProps {
  onAddSnapshotClick: () => void;
  snapshots: SnapshotGeneralInfo[];
  onUpdateClick: (snapshotId: number) => void;
  onLoadClick: (snapshotId: number) => void;
  onDeleteClick: (snapshotId: number) => void;
}

export interface SnapshotItemProps extends SnapshotGeneralInfo {
  onUpdateClick: () => void;
  onLoadClick: () => void;
  onDeleteClick: () => void;
}

function CustomListItemText(props: ListItemTextProps) {
  if (!props.secondary) return null;
  return (
    <ListItem sx={{ m: 0, p: 0, mb: 0.5 }}>
      <ListItemText sx={{ m: 0 }} primary={props.primary} secondary={props.secondary} />
    </ListItem>
  );
}

function SnapshotItem(props: SnapshotItemProps) {
  return (
    <SidebarPaper>
      <Collapse
        isOpen={false}
        label={props.name || props.tree?.label}
        ListItemTextProps={{ primaryTypographyProps: { variant: "body1" } }}
        ListItemButtonProps={{ sx: { p: 2, pb: 1 } }}
        rootBoxProps={{ sx: { p: 0 } }}
      >
        <Box sx={{ p: 2, pt: 0 }}>
          <List>
            <CustomListItemText primary="id снимка:" secondary={props.id} />
            <CustomListItemText primary="id графа:" secondary={props.tree?.id} />
            <CustomListItemText primary="название графа" secondary={props.tree?.label} />
            <CustomListItemText primary="кем создан" secondary={props.tree?.created_by} />
            <CustomListItemText primary="кем обновлен" secondary={props.tree?.updated_by} />
            <CustomListItemText primary="время создания" secondary={props.tree?.created_at} />
            <CustomListItemText primary="время обновления" secondary={props.tree?.updated_at} />
          </List>
          <Button fullWidth variant="outlined" size="small" onClick={props.onLoadClick} sx={{ mb: 1 }}>
            Загрузить на граф
          </Button>
          <Button fullWidth variant="outlined" size="small" onClick={props.onUpdateClick} sx={{ mb: 1 }}>
            Заменить текущим графом
          </Button>
          <Button fullWidth variant="outlined" size="small" color="error" onClick={props.onDeleteClick} sx={{ mb: 1 }}>
            Удалить
          </Button>
        </Box>
      </Collapse>
    </SidebarPaper>
  );
}

function SnapshotList(props: SnapshotListProps) {
  return (
    <>
      <Box sx={{ m: 2, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Button variant="contained" onClick={props.onAddSnapshotClick}>
          Создать снимок
        </Button>
      </Box>
      {props.snapshots.map((item) => (
        <SnapshotItem
          key={item.id}
          {...item}
          onLoadClick={() => {
            props.onLoadClick(+(item.id || 0));
          }}
          onUpdateClick={() => {
            props.onUpdateClick(+(item.id || 0));
          }}
          onDeleteClick={() => {
            props.onDeleteClick(+(item.id || 0));
          }}
        />
      ))}
    </>
  );
}

export default SnapshotList;
