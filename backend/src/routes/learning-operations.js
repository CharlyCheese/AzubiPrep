// Die lokale Express-App behält ihre vorhandenen JSON-Fehler und Middleware.
export function mountLearningOperations(router, operations, fallbackError) {
  for (const { method, path, run } of operations) {
    router[method.toLowerCase()](path, async (req, res, next) => {
      try {
        res.json(await run(req));
      } catch (error) {
        if (error.status >= 400 && error.status < 500) {
          res.status(error.status).json({ error: error.message });
        } else if (fallbackError) {
          res.status(500).json({ error: fallbackError });
        } else {
          next(error);
        }
      }
    });
  }
}
