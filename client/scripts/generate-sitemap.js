import fs from "fs";
import { SitemapStream, streamToPromise } from "sitemap";

(async () => {
  const links = [{ url: "/", changefreq: "daily", priority: 1.0 }];

  const stream = new SitemapStream({
    hostname: "https://draw-guess-pied.vercel.app",
  });
  links.forEach((link) => stream.write(link));
  stream.end();

  const data = await streamToPromise(stream);
  fs.writeFileSync("./public/sitemap.xml", data.toString());
})();
