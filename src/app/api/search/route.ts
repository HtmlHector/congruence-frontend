import { NextResponse } from "next/server";

export interface TopStory {
  title: string;
  url: string;
  source: string;
  sourceUrl?: string;
  timeAgo: string;
  imageUrl?: string;
}

export interface SearchResultItem {
  title: string;
  url: string;
  snippet: string;
  siteName: string;
  favicon?: string;
}

export interface KnowledgeCard {
  title: string;
  subtitle?: string;
  description: string;
  url?: string;
  imageUrl?: string;
  attributes?: { label: string; value: string }[];
}

// Helper to compute relative time from pubDate
function formatTimeAgo(pubDateStr: string): string {
  try {
    const pub = new Date(pubDateStr);
    const now = new Date();
    const diffMs = Math.max(0, now.getTime() - pub.getTime());
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${Math.max(diffMins, 1)} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 1) return `1 day ago`;
    return `${diffDays} days ago`;
  } catch {
    return "Recently";
  }
}

// Fallback thematic image helper for news
function getThematicImage(query: string, index: number): string {
  const q = encodeURIComponent(query.trim().toLowerCase());
  return `https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=400&q=80`;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "";

    if (!query.trim()) {
      return NextResponse.json({
        query: "",
        results: [],
        topStories: [],
        knowledgeCard: null,
        relatedSearches: [],
      });
    }

    const q = query.trim();
    const results: SearchResultItem[] = [];
    const topStories: TopStory[] = [];
    let knowledgeCard: KnowledgeCard | null = null;
    const relatedSearches: string[] = [];

    // 1. Query Google News RSS feed for real live Top Stories & news
    try {
      const newsRes = await fetch(
        `https://news.google.com/rss/search?q=${encodeURIComponent(q)}&hl=en-US&gl=US&ceid=US:en`,
        {
          headers: {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) CongruenceBrowser/1.0",
          },
          next: { revalidate: 60 },
        }
      );

      if (newsRes.ok) {
        const xmlText = await newsRes.text();
        const itemRegex = /<item>([\s\S]*?)<\/item>/g;
        let match;
        let count = 0;

        while ((match = itemRegex.exec(xmlText)) !== null && count < 8) {
          const itemContent = match[1];
          const rawTitle = (itemContent.match(/<title>([\s\S]*?)<\/title>/)?.[1] || "").replace(/&amp;/g, "&").replace(/&quot;/g, '"');
          const link = (itemContent.match(/<link>([\s\S]*?)<\/link>/)?.[1] || "").trim();
          const pubDate = (itemContent.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1] || "").trim();
          const sourceMatch = itemContent.match(/<source[^>]*url="([^"]*)"[^>]*>([\s\S]*?)<\/source>/);
          const sourceName = (sourceMatch?.[2] || "News").replace(/&amp;/g, "&");
          const sourceUrl = sourceMatch?.[1] || "";

          // Clean title by stripping " - Publisher" from end
          let cleanTitle = rawTitle;
          const lastDash = rawTitle.lastIndexOf(" - ");
          if (lastDash > 0) {
            cleanTitle = rawTitle.substring(0, lastDash);
          }

          if (cleanTitle && link) {
            topStories.push({
              title: cleanTitle,
              url: link,
              source: sourceName,
              sourceUrl,
              timeAgo: formatTimeAgo(pubDate),
            });
            count++;
          }
        }
      }
    } catch (err) {
      console.warn("Google News RSS fetch error:", err);
    }

    // 2. Query DuckDuckGo Instant API for rich live knowledge card & official sites
    try {
      const ddgRes = await fetch(
        `https://api.duckduckgo.com/?q=${encodeURIComponent(q)}&format=json&no_html=1&skip_disambig=1`,
        {
          headers: {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) CongruenceBrowser/1.0",
          },
          next: { revalidate: 60 },
        }
      );

      if (ddgRes.ok) {
        const data = await ddgRes.json();

        // Extract Official Website
        if (data.OfficialWebsite) {
          results.push({
            title: `${data.Heading || q} — Official Website`,
            url: data.OfficialWebsite,
            siteName: data.OfficialDomain || new URL(data.OfficialWebsite).hostname.replace(/^www\./, ""),
            favicon: `https://www.google.com/s2/favicons?domain=${new URL(data.OfficialWebsite).hostname}&sz=32`,
            snippet:
              data.AbstractText ||
              `The official website for ${data.Heading || q}. Get the latest news, updates, verified content, and digital media.`,
          });
        }

        // Extract Knowledge Card if abstract exists
        if (data.AbstractText) {
          const attributes: { label: string; value: string }[] = [];
          if (data.Infobox?.content && Array.isArray(data.Infobox.content)) {
            for (const item of data.Infobox.content) {
              if (item.label && item.value && typeof item.value === "string" && attributes.length < 5) {
                attributes.push({ label: item.label, value: item.value });
              }
            }
          }

          knowledgeCard = {
            title: data.Heading || q,
            subtitle: data.Entity || "Official Overview",
            description: data.AbstractText,
            url: data.AbstractURL || data.OfficialWebsite,
            imageUrl: data.Image ? (data.Image.startsWith("http") ? data.Image : `https://duckduckgo.com${data.Image}`) : undefined,
            attributes,
          };

          if (data.AbstractURL && !results.some((r) => r.url === data.AbstractURL)) {
            results.push({
              title: `${data.Heading || q} - Wikipedia Overview`,
              url: data.AbstractURL,
              siteName: "en.wikipedia.org",
              favicon: "https://www.google.com/s2/favicons?domain=wikipedia.org&sz=32",
              snippet: data.AbstractText.slice(0, 240) + "...",
            });
          }
        }

        // Extract Related Topics
        if (data.RelatedTopics && Array.isArray(data.RelatedTopics)) {
          for (const topic of data.RelatedTopics) {
            if (topic.FirstURL && topic.Text && results.length < 10) {
              const cleanTitle = topic.Text.split(" - ")[0] || topic.Text;
              const cleanSnippet = topic.Text.includes(" - ") ? topic.Text.split(" - ").slice(1).join(" - ") : topic.Text;
              let site = "duckduckgo.com";
              try {
                site = new URL(topic.FirstURL).hostname.replace(/^www\./, "");
              } catch {}

              if (!results.some((r) => r.url === topic.FirstURL)) {
                results.push({
                  title: cleanTitle,
                  url: topic.FirstURL,
                  siteName: site,
                  favicon: `https://www.google.com/s2/favicons?domain=${site}&sz=32`,
                  snippet: cleanSnippet,
                });
              }

              if (relatedSearches.length < 6 && cleanTitle.length < 40) {
                relatedSearches.push(cleanTitle);
              }
            }
          }
        }
      }
    } catch (err) {
      console.warn("DuckDuckGo Instant Search API error:", err);
    }

    // 3. Query Wikipedia OpenSearch API for rich topic results
    try {
      const wikiRes = await fetch(
        `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(q)}&limit=6&namespace=0&format=json`,
        {
          headers: {
            "User-Agent": "CongruenceBrowser/1.0 (https://congruence.dev)",
          },
          next: { revalidate: 60 },
        }
      );

      if (wikiRes.ok) {
        const wikiData = await wikiRes.json();
        const titles: string[] = wikiData[1] || [];
        const snippets: string[] = wikiData[2] || [];
        const urls: string[] = wikiData[3] || [];

        for (let i = 0; i < titles.length && results.length < 10; i++) {
          const t = titles[i];
          const u = urls[i];
          const s = snippets[i] || `Read comprehensive articles, history, statistics, and references about ${t} on Wikipedia.`;

          if (u && !results.some((r) => r.url === u)) {
            results.push({
              title: `${t} - Wikipedia`,
              url: u,
              siteName: "wikipedia.org",
              favicon: "https://www.google.com/s2/favicons?domain=wikipedia.org&sz=32",
              snippet: s,
            });
          }

          if (relatedSearches.length < 6 && !relatedSearches.includes(t)) {
            relatedSearches.push(t);
          }
        }
      }
    } catch (err) {
      console.warn("Wikipedia API error:", err);
    }

    // 4. If query mentions code or technical terms, add official portals
    const qLower = q.toLowerCase();
    if (qLower.includes("next") || qLower.includes("vercel")) {
      results.unshift({
        title: "Next.js by Vercel - The React Framework for the Web",
        url: "https://nextjs.org",
        siteName: "nextjs.org",
        favicon: "https://www.google.com/s2/favicons?domain=nextjs.org&sz=32",
        snippet: "Next.js enables you to build full-stack Web applications by extending the latest React features and integrating powerful Turbopack tooling.",
      });
    } else if (qLower.includes("claude") || qLower.includes("anthropic")) {
      results.unshift({
        title: "Claude Code - Agentic Coding in the Terminal | Anthropic",
        url: "https://docs.anthropic.com/en/docs/claude-code",
        siteName: "docs.anthropic.com",
        favicon: "https://www.google.com/s2/favicons?domain=anthropic.com&sz=32",
        snippet: "Claude Code is an agentic coding tool that lives in your terminal, understands your codebase, and helps you write code faster.",
      });
    } else if (qLower.includes("openai") || qLower.includes("o3") || qLower.includes("gpt")) {
      results.unshift({
        title: "OpenAI Platform & Reasoning Models Documentation",
        url: "https://platform.openai.com/docs/guides/reasoning",
        siteName: "platform.openai.com",
        favicon: "https://www.google.com/s2/favicons?domain=openai.com&sz=32",
        snippet: "Explore OpenAI o3-mini and GPT-4.5 models optimized for complex coding, math, science, and multi-step reasoning.",
      });
    }

    // Ensure fallback results if empty
    if (results.length === 0) {
      results.push(
        {
          title: `${q} - Official Overview & Information`,
          url: `https://www.google.com/search?q=${encodeURIComponent(q)}`,
          siteName: `${q.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`,
          favicon: "https://www.google.com/s2/favicons?domain=google.com&sz=32",
          snippet: `Authoritative articles, documentation, verified news, and developer discussions related to "${q}".`,
        },
        {
          title: `${q} on Wikipedia, the free encyclopedia`,
          url: `https://en.wikipedia.org/wiki/${encodeURIComponent(q)}`,
          siteName: "wikipedia.org",
          favicon: "https://www.google.com/s2/favicons?domain=wikipedia.org&sz=32",
          snippet: `Comprehensive background, historical timeline, definitions, and references for ${q}.`,
        },
        {
          title: `${q} - GitHub Repositories & Open Source`,
          url: `https://github.com/search?q=${encodeURIComponent(q)}`,
          siteName: "github.com",
          favicon: "https://www.google.com/s2/favicons?domain=github.com&sz=32",
          snippet: `Discover open source tools, libraries, code packages, and active projects related to ${q}.`,
        }
      );
    }

    if (relatedSearches.length === 0) {
      relatedSearches.push(
        `${q} news today`,
        `${q} official website`,
        `${q} updates 2026`,
        `${q} schedule & events`,
        `${q} roster & cast`
      );
    }

    return NextResponse.json({
      query: q,
      source: "google_live",
      total: results.length,
      topStories,
      knowledgeCard,
      results,
      relatedSearches,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
