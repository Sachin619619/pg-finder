export function validateBotRequest(req: Request): boolean {
  const secret = req.headers.get("x-bot-secret");
  return secret === process.env.ACTIONBOT_SECRET;
}
