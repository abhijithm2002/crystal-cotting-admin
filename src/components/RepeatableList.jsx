import { Box, Button, IconButton, Paper, Stack, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

// Generic repeatable-array-of-objects editor for form-embedded lists
// (hero buttons, heroStats, whyChoose cards, footer socials, etc).
// `items` is a plain array; `onChange` receives the full new array.
export default function RepeatableList({
  title,
  items = [],
  onChange,
  renderItem,
  emptyItem,
  addLabel = 'Add item',
  minItems = 0,
}) {
  const handleAdd = () => {
    onChange([...items, typeof emptyItem === 'function' ? emptyItem() : { ...emptyItem }]);
  };

  const handleRemove = (index) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const handleUpdate = (index, newItem) => {
    onChange(items.map((it, i) => (i === index ? newItem : it)));
  };

  const handleMove = (index, direction) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= items.length) return;
    const next = [...items];
    const [moved] = next.splice(index, 1);
    next.splice(newIndex, 0, moved);
    onChange(next);
  };

  return (
    <Box>
      {title && (
        <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>
          {title}
        </Typography>
      )}
      <Stack spacing={2}>
        {items.map((item, index) => (
          <Paper key={item._localKey || item._id || index} variant="outlined" sx={{ p: 2, position: 'relative' }}>
            <Stack direction="row" spacing={1} sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}>
              <IconButton size="small" onClick={() => handleMove(index, -1)} disabled={index === 0}>
                <ArrowUpwardIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" onClick={() => handleMove(index, 1)} disabled={index === items.length - 1}>
                <ArrowDownwardIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                color="error"
                onClick={() => handleRemove(index)}
                disabled={items.length <= minItems}
              >
                <DeleteOutlineIcon fontSize="small" />
              </IconButton>
            </Stack>
            <Box sx={{ pr: 12 }}>{renderItem(item, (newItem) => handleUpdate(index, newItem), index)}</Box>
          </Paper>
        ))}
      </Stack>
      <Button startIcon={<AddIcon />} onClick={handleAdd} sx={{ mt: 2 }} variant="outlined" size="small">
        {addLabel}
      </Button>
    </Box>
  );
}
