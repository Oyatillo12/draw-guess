import { useEffect } from "react";

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
}

export function useSEO({
  title = "Draw & Guess – Multiplayer Game",
  description = "Play Draw & Guess online with friends in real-time. Guess words, draw clues, and have fun!",
  image = "/cover.png",
  url = "https://draw-guess-pied.vercel.app",
}: SEOProps) {
  useEffect(() => {
    // Update title
    if (title) document.title = title;

    // Helper to update or create a meta tag
    const updateMeta = (name: string, content: string) => {
      let tag = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
      if (!tag) {
        tag = document.createElement("meta");
        tag.name = name;
        document.head.appendChild(tag);
      }
      tag.content = content;
    };

    updateMeta("description", description);
    updateMeta("og:title", title);
    updateMeta("og:description", description);
    updateMeta("og:image", image);
    updateMeta("og:url", url);
    updateMeta("twitter:card", "summary_large_image");
    updateMeta("twitter:title", title);
    updateMeta("twitter:description", description);
    updateMeta("twitter:image", image);

  }, [title, description, image, url]);
}
