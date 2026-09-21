import { Box, Card, CardContent, Typography } from '@mui/material';

export default function PageHeaderCard({
  title,
  subtitle,
  icon,
  titleAdornment,
  actions,
}) {
  return (
    <Card
      sx={{
        mb: 3,
        border: '1px solid rgba(15, 23, 42, 0.08)',
        bgcolor: '#FFFFFF',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.04)',
      }}
    >
      <CardContent sx={{ p: { xs: 2, md: 2.25 }, '&:last-child': { pb: { xs: 2, md: 2.25 } } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, flexWrap: 'wrap' }}>
              {icon && (
                <Box
                  sx={{
                    color: '#1B4D24',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 32,
                    height: 32,
                    borderRadius: 1.5,
                    bgcolor: 'rgba(27, 77, 36, 0.08)',
                  }}
                >
                  {icon}
                </Box>
              )}
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 800,
                  color: '#0F172A',
                  letterSpacing: '-0.025em',
                  lineHeight: 1.2,
                }}
              >
                {title}
              </Typography>
              {titleAdornment}
            </Box>
            {subtitle && (
              <Typography
                variant="body2"
                sx={{
                  color: '#64748B',
                  mt: 0.5,
                  fontSize: '0.85rem',
                  lineHeight: 1.45,
                }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>
          {actions && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              {actions}
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}