export function isAuthenticated(req, res, next) {
  console.log("Session:", req.session);
  if (req.isAuthenticated()) {
    console.log("User is authenticated");
    return next();
  }
  res.status(401).json({ error: "Unauthorized" });
}
