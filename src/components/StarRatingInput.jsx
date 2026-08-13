import { Rating, Stack, Typography } from '@mui/material';

export default function StarRatingInput({ label = 'Rating', value = 5, onChange }) {
  return (
    <Stack spacing={0.5}>
      {label && (
        <Typography variant="caption" color="text.secondary">
          {label}
        </Typography>
      )}
      <Rating
        value={Number(value) || 0}
        max={5}
        onChange={(_e, newValue) => onChange(newValue || 1)}
      />
    </Stack>
  );
}
