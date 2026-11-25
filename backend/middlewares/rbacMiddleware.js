export const authorizeRoles = (...allowedRoles) => (req, res, next) => {
  if (!req.user || !allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Access Denied: Insufficient authorization level.' });
  }
  next();
};

// Base Commanders are pinned to their own base on reads AND writes.
// Admins/Logistics Officers keep the base they ask for (or all bases when none is given).
export const enforceBaseScope = (req, res, next) => {
  if (req.user.role === 'BASE_COMMANDER') {
    req.query.baseId = req.user.baseId;
    if (req.body && typeof req.body === 'object') {
      if ('baseId' in req.body) req.body.baseId = req.user.baseId;
      if ('sourceBaseId' in req.body && Number(req.body.sourceBaseId) !== Number(req.user.baseId)) {
        return res.status(403).json({ message: 'Access Denied: you can only transfer out of your own base.' });
      }
    }
  }
  next();
};
