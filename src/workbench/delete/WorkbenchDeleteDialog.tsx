import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Stack,
  Typography,
} from '@mui/material';
import type { WorkbenchDeleteImpact } from '../api/workbenchContracts';

interface WorkbenchDeleteDialogProps {
  readonly cancelLabel: string;
  readonly confirmLabel: string;
  readonly deleting: boolean;
  readonly deletingLabel: string;
  readonly enterpriseCode: string;
  readonly enterpriseLabel: string;
  readonly error?: string | undefined;
  readonly impact?: WorkbenchDeleteImpact | undefined;
  readonly impactLoading?: boolean;
  readonly impactLoadingLabel?: string;
  readonly impactBlockedLabel?: string;
  readonly impactClearLabel?: string;
  readonly identity: string;
  readonly open: boolean;
  readonly schemaLabel: string;
  readonly tenantCode: string;
  readonly tenantLabel: string;
  readonly title: string;
  readonly warning: string;
  readonly onCancel: () => void;
  readonly onConfirm: () => Promise<void>;
}

export function WorkbenchDeleteDialog(props: WorkbenchDeleteDialogProps) {
  return (
    <Dialog
      fullWidth
      aria-describedby="workbench-delete-description"
      maxWidth="sm"
      open={props.open}
      onClose={props.deleting ? undefined : props.onCancel}
    >
      <DialogTitle>{props.title}</DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          <DialogContentText id="workbench-delete-description">
            {props.warning}
          </DialogContentText>
          <Stack spacing={0.5}>
            <Typography>
              {props.schemaLabel}: {props.identity}
            </Typography>
            <Typography color="text.secondary" variant="body2">
              {props.tenantLabel}: {props.tenantCode}
            </Typography>
            <Typography color="text.secondary" variant="body2">
              {props.enterpriseLabel}: {props.enterpriseCode}
            </Typography>
          </Stack>
          {props.error ? <Alert severity="error">{props.error}</Alert> : null}
          {props.impactLoading ? (
            <Alert severity="info">{props.impactLoadingLabel}</Alert>
          ) : null}
          {props.impact ? (
            <Alert severity={props.impact.blocked ? 'warning' : 'success'}>
              {props.impact.blocked ? props.impactBlockedLabel : props.impactClearLabel}
              {props.impact.relationships
                .filter((relationship) => relationship.referenceCount > 0)
                .map(
                  (relationship) =>
                    ` ${relationship.sourceModule}.${relationship.sourceSchema}.${relationship.field}: ${String(relationship.referenceCount)}.`,
                )}
            </Alert>
          ) : null}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button disabled={props.deleting} onClick={props.onCancel}>
          {props.cancelLabel}
        </Button>
        <Button
          color="error"
          disabled={
            props.deleting || props.impactLoading || props.impact?.blocked === true
          }
          variant="contained"
          onClick={() => void props.onConfirm()}
        >
          {props.deleting ? props.deletingLabel : props.confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
