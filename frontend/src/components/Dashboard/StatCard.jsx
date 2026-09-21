import { Card, CardContent, Box, Typography, Avatar } from '@mui/material';

export default function StatCard({ title, value, subtitle, icon, color = 'primary.main', trend }) {
  return (
    <Card
      sx={{
        height: '100%',
        bgcolor: '#FFFFFF',
        border: '1px solid rgba(15, 23, 42, 0.08)',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.04)',
        transition: 'border-color 150ms ease, box-shadow 150ms ease',
        '&:hover': {
          borderColor: 'rgba(27, 77, 36, 0.2)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
        },
      }}
    >
      <CardContent sx={{ p: 2.25, '&:last-child': { pb: 2.25 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
          <Typography
            variant="caption"
            sx={{
              fontWeight: 700,
              color: '#64748B',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              fontSize: '0.72rem',
            }}
          >
            {title}
          </Typography>
          {icon && (
            <Box
              sx={{
                width: 30,
                height: 30,
                borderRadius: 1.5,
                bgcolor: 'rgba(15, 23, 42, 0.04)',
                color: color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1rem',
              }}
            >
              {icon}
            </Box>
          )}
        </Box>

        <Typography
          variant="h4"
          sx={{
            fontWeight: 800,
            color: '#0F172A',
            letterSpacing: '-0.03em',
            fontVariantNumeric: 'tabular-nums',
            lineHeight: 1.1,
            mb: 0.5,
          }}
        >
          {value ?? '—'}
        </Typography>

        {subtitle && (
          <Typography
            variant="caption"
            sx={{
              color: '#64748B',
              display: 'block',
              fontSize: '0.75rem',
              lineHeight: 1.3,
            }}
          >
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}
