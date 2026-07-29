function formatarErro(zodError, fallback) {
  const primeiro = zodError.issues[0];
  if (!primeiro) return fallback;
  const campo = primeiro.path && primeiro.path.length ? `${primeiro.path.join('.')}: ` : '';
  return `${campo}${primeiro.message}`;
}

// Valida req.body contra um schema zod. Em caso de sucesso, substitui req.body
// pelo dado já validado/coagido (ex.: page como number, não string).
function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ erro: formatarErro(result.error, 'Payload inválido') });
    }
    req.body = result.data;
    next();
  };
}

// Mesma ideia de validate, mas para req.query (paginação, filtros).
function validateQuery(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      return res.status(400).json({ erro: formatarErro(result.error, 'Parâmetros inválidos') });
    }
    req.query = result.data;
    next();
  };
}

module.exports = { validate, validateQuery };
