import http from "node:http";
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const types = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".json": "application/json; charset=utf-8", ".geojson": "application/geo+json", ".svg": "image/svg+xml", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp", ".woff2": "font/woff2", ".txt": "text/plain; charset=utf-8" };
export function createStaticServer(directory = path.join(appRoot, "dist")) {
  const root = path.resolve(directory);
  return http.createServer(async (request, response) => {
    if (!["GET", "HEAD"].includes(request.method)) { response.writeHead(405, { Allow: "GET, HEAD" }); response.end(); return; }
    let target;
    try {
      const pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
      if (pathname.includes("\0")) throw new Error("Invalid path");
      target = path.resolve(root, "." + (pathname === "/" ? "/index.html" : pathname));
      if (!target.startsWith(root + path.sep)) { response.writeHead(403); response.end("Forbidden"); return; }
    } catch { response.writeHead(400); response.end("Bad request"); return; }
    try {
      const file = await stat(target);
      if (!file.isFile()) throw new Error("Not a file");
      response.writeHead(200, { "Content-Type": types[path.extname(target)] || "application/octet-stream", "Content-Length": file.size, "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" });
      if (request.method === "HEAD") response.end();
      else createReadStream(target).on("error", () => response.destroy()).pipe(response);
    } catch { response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" }); response.end("Not found"); }
  });
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const portArg = process.argv.indexOf("--port");
  const port = Number(portArg >= 0 ? process.argv[portArg + 1] : 5083);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error("Invalid port");
  await stat(path.join(appRoot, "dist", "index.html"));
  const server = createStaticServer();
  server.on("error", (error) => { console.error(`Preview could not start: ${error.code}`); process.exitCode = 1; });
  server.listen(port, "127.0.0.1", () => console.log(`Gomrok built preview: http://127.0.0.1:${port}/`));
}
