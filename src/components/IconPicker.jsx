import { MenuItem, TextField, Box } from '@mui/material';
import * as LucideIcons from 'lucide-react';
import { ICON_NAMES } from '../utils/iconList.js';

export function DynamicIcon({ name, size = 18, ...props }) {
  const Cmp = LucideIcons[name];
  if (!Cmp) return null;
  return <Cmp size={size} {...props} />;
}

export default function IconPicker({ label = 'Icon', value, onChange, fullWidth = true, size = 'small' }) {
  return (
    <TextField
      select
      label={label}
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      fullWidth={fullWidth}
      size={size}
    >
      <MenuItem value="">
        <em>None</em>
      </MenuItem>
      {ICON_NAMES.map((name) => (
        <MenuItem key={name} value={name}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <DynamicIcon name={name} size={16} />
            {name}
          </Box>
        </MenuItem>
      ))}
    </TextField>
  );
}
