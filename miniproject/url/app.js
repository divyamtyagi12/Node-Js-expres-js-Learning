import { createServer } from "http";
import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";

const DATA_FILE = path.join("data", "links.json");

const server = createServer(async (req, res) => {

    const serveFile = async (res, filePath, contentType) => {
        try {
            const data = await readFile(filePath);
            res.writeHead(200, { "Content-Type": contentType });
            res.end(data);
        }
        catch (err) {
            res.writeHead(404, { "Content-Type": "text/plain" });
            res.end("File not found");
        }
    };

    const loadLinks = async () => {
        try {
            const data = await readFile(DATA_FILE, "utf-8");
            return JSON.parse(data);
        }
        catch (error) {
            if (error.code == "ENOENT") {
                await mkdir("data", { recursive: true });
                await writeFile(DATA_FILE, JSON.stringify({}));
                return {};
            }
            throw error;
        }
    };

    const saveLinks = async (links) => {
        await writeFile(DATA_FILE, JSON.stringify(links, null, 2));
    };

    try {
        if (req.method == "GET" && req.url == "/") {
            return serveFile(res, path.join("public", "index.html"), "text/html");
        }

        if (req.method == "GET" && req.url == "/style.css") {
            return serveFile(res, path.join("public", "style.css"), "text/css");
        }

        if (req.method == "POST" && req.url == "/shorten") {
            let body = "";

            req.on("data", (chunk) => {
                body += chunk;
            });

            req.on("end", async () => {
                try {
                    const { url, shortcode } = JSON.parse(body);

                    if (!url || typeof url !== "string") {
                        res.writeHead(400, { "Content-Type": "application/json" });
                        return res.end(JSON.stringify({ error: "URL is required" }));
                    }

                    let parsedUrl;

                    try {
                        parsedUrl = new URL(url);
                    }
                    catch {
                        res.writeHead(400, { "Content-Type": "application/json" });
                        return res.end(JSON.stringify({ error: "Invalid URL" }));
                    }

                    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
                        res.writeHead(400, { "Content-Type": "application/json" });
                        return res.end(JSON.stringify({ error: "Only HTTP and HTTPS URLs are allowed" }));
                    }

                    if (
                        typeof shortcode !== "undefined" &&
                        (typeof shortcode !== "string" ||
                         (shortcode !== "" && !/^[a-zA-Z0-9_-]+$/.test(shortcode)))
                    ) {
                        res.writeHead(400, { "Content-Type": "application/json" });
                        return res.end(JSON.stringify({ error: "Invalid shortcode" }));
                    }

                    const links = await loadLinks();

                    let finalShortcode = shortcode || crypto.randomBytes(8).toString("hex");

                    if (!shortcode) {
                        while (Object.hasOwn(links, finalShortcode)) {
                            finalShortcode = crypto.randomBytes(8).toString("hex");
                        }
                    }

                    if (Object.hasOwn(links, finalShortcode)) {
                        res.writeHead(409, { "Content-Type": "application/json" });
                        return res.end(JSON.stringify({
                            error: "Already exists, choose another"
                        }));
                    }

                    links[finalShortcode] = url;
                    await saveLinks(links);

                    res.writeHead(201, { "Content-Type": "application/json" });
                    res.end(JSON.stringify({
                        shortcode: finalShortcode,
                        shortUrl: `http://${req.headers.host}/${finalShortcode}`
                    }));

                }
                catch (error) {
                    console.error(error);
                    res.writeHead(
                        error instanceof SyntaxError ? 400 : 500,
                        { "Content-Type": "application/json" }
                    );
                    res.end(JSON.stringify({
                        error: error instanceof SyntaxError
                            ? "Invalid JSON"
                            : "Internal server error"
                    }));
                }
            });

            return;
        }

        // Redirect shortened URLs
        if (req.method == "GET") {
            const shortcode = req.url.slice(1);
            const links = await loadLinks();

            if (Object.hasOwn(links, shortcode)) {
                res.writeHead(302, {
                    "Location": links[shortcode]
                });

                return res.end();
            }
        }

        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("Route not found");

    }
    catch (error) {
        console.error(error);

        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("Internal server error");
    }
});

server.listen(4000, () => {
    console.log("Server is running on port 4000");
});