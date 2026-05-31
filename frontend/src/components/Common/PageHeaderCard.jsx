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
        border: '1px solid',
        borderColor: 'rgba(27, 94, 32, 0.16)',
        background: 'linear-gradient(135deg, #F6FBF6 0%, #FFFFFF 100%)',
      }}
    >
      <CardContent sx={{ p: { xs: 2, md: 2.5 }, '&:last-child': { pb: { xs: 2, md: 2.5 } } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              {icon && <Box sx={{ color: 'primary.main', display: 'inline-flex' }}>{icon}</Box>}
              <Typography variant="h5" fontWeight={800} color="primary.dark">
                {title}
              </Typography>
              {titleAdornment}
            </Box>
            {subtitle && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {subtitle}
              </Typography>
            )}
          </Box>
          {actions}
        </Box>
      </CardContent>
    </Card>
  );
}