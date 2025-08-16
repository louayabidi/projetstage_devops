const jwt = require('jsonwebtoken');

exports.identifier = (req, res, next) => {
  try {
    let token = req.headers.authorization || req.cookies['Authorization'];

    if (!token) {
      return res.status(403).json({
        success: false,
        message: 'No token provided, authorization denied',
      });
    }

    // Si token vient des cookies, il peut être URL encodé, on le décode
    token = decodeURIComponent(token);

    // Supprimer "Bearer " si présent
    const userToken = token.startsWith('Bearer ') ? token.split(' ')[1] : token;

    const jwtVerified = jwt.verify(userToken, process.env.TOKEN_SECRET);

    req.user = jwtVerified;
    next();
  } catch (error) {
    console.error(error);
    return res.status(403).json({
      success: false,
      message: 'Invalid token or session expired',
    });
  }
};
