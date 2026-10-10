// Client details recorded against refresh tokens.
export default function requestMeta(req) {
  const userAgent = req.get('user-agent');
  return {
    ip: req.ip ? req.ip.slice(0, 45) : null,
    userAgent: userAgent ? userAgent.slice(0, 512) : null,
  };
}
