const zonasPermitidas = {
  '1884': ['Berazategui Centro'],
  '1885': ['Berazategui Oeste', 'Villa España'],
  '1886': ['Ranelagh', 'Plátanos'],
  '1887': ['Marítimo'],
  '1888': ['Sourigues', 'Bosques'],
  '1889': ['Hudson'],
};

const validarCheckout = (req, res, next) => {
  const { address, shipping } = req.body;
    // Si es retiro, no validar dirección
  if (shipping === 'retiro') {
    return next();
  }
  if(!zonasPermitidas[address?.zip]?.includes(address?.city)) {
    return res.status(400).json({
      ok: false,
      msg: 'Localidad o código postal no válidos para envío.'
    });
  }

  next();
};

module.exports = validarCheckout;
