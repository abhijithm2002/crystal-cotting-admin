import { TextField } from '@mui/material';

// Simple multiline text field used for longer copy (descriptions, review
// text, etc). Kept as plain text (no WYSIWYG) since the API contract stores
// these fields as plain strings.
export default function RichTextField({ label, value, onChange, minRows = 4, ...props }) {
  return (
    <TextField
      label={label}
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      fullWidth
      multiline
      minRows={minRows}
      {...props}
    />
  );
}
