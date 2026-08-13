import { Card, CardContent, Box, Typography, Avatar } from '@mui/material';

export default function StatCard({ label, value, icon: Icon, color = 'primary' }) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="body2" color="text.secondary" fontWeight={500}>
              {label}
            </Typography>
            <Typography variant="h4" fontWeight={700} sx={{ mt: 0.5 }}>
              {value ?? 0}
            </Typography>
          </Box>
          {Icon && (
            <Avatar
              variant="rounded"
              sx={{
                bgcolor: `${color}.main`,
                opacity: 0.15,
                color: `${color}.main`,
                width: 48,
                height: 48,
              }}
            >
              <Icon />
            </Avatar>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
