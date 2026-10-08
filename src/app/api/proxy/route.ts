import { NextResponse } from "next/server";
import { ApiAuthError, requireUser } from "@/lib/api-auth";

export async function GET(req: Request) {
  try {
    // Open URL proxy: only signed-in users may use it.
    await requireUser();
    const { searchParams } = new URL(req.url);
    let targetUrl = searchParams.get("url");

    if (!targetUrl) {
      return new NextResponse("Invalid URL provided to proxy", { status: 400 });
    }

    targetUrl = targetUrl.trim();

    // If query is not a full URL, treat as web search
    if (!targetUrl.startsWith("http://") && !targetUrl.startsWith("https://")) {
      if (!targetUrl.includes(".")) {
        targetUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(targetUrl)}`;
      } else {
        targetUrl = `https://${targetUrl}`;
      }
    }

    const response = await fetch(targetUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
      redirect: "follow",
    });

    const contentType = response.headers.get("content-type") || "text/html";
    
    // For non-HTML (images, fonts, stylesheets, scripts), pipe the raw buffer
    if (!contentType.includes("text/html")) {
      const buffer = await response.arrayBuffer();
      return new NextResponse(buffer, {
        status: response.status,
        headers: {
          "Content-Type": contentType,
          "Access-Control-Allow-Origin": "*",
          "Cache-Control": "public, max-age=3600",
        },
      });
    }

    let body = await response.text();
    const finalUrl = response.url || targetUrl;
    const baseUrl = new URL(finalUrl).origin;

    // Inject base tag and link-interceptor script for in-browser iframe navigation
    const injectedScript = `
      <base href="${baseUrl}/">
      <script>
        (function() {
          // Notify parent window of current URL
          try {
            window.parent.postMessage({ type: 'CONGRUENCE_NAVIGATED', url: '${finalUrl}' }, '*');
          } catch(e) {}

          // Intercept link clicks so navigation stays within proxy
          document.addEventListener('click', function(e) {
            var target = e.target.closest('a');
            if (target && target.href && !target.href.startsWith('javascript:')) {
              e.preventDefault();
              var dest = target.href;
              window.location.href = '/api/proxy?url=' + encodeURIComponent(dest);
            }
          }, true);
        })();
      </script>
    `;

    if (body.includes("<head>")) {
      body = body.replace("<head>", `<head>${injectedScript}`);
    } else if (body.includes("<html>")) {
      body = body.replace("<html>", `<html><head>${injectedScript}</head>`);
    } else {
      body = `${injectedScript}${body}`;
    }

    return new NextResponse(body, {
      status: response.status,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=120",
      },
    });
  } catch (err: any) {
    if (err instanceof ApiAuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return new NextResponse(
      `<!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; text-align: center; color: #333; background: #fafafa; }
            .card { max-width: 500px; margin: 0 auto; background: white; padding: 30px; border: 1px solid #e0e0e0; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
            h2 { color: #d32f2f; margin-top: 0; }
            p { font-size: 14px; color: #666; line-height: 1.5; }
            a { display: inline-block; margin-top: 15px; padding: 8px 16px; background: #1a73e8; color: white; text-decoration: none; border-radius: 4px; font-size: 13px; }
          </style>
        </head>
        <body>
          <div class="card">
            <h2>Unable to load page</h2>
            <p>Could not load the requested destination directly via proxy (${err.message}).</p>
            <a href="https://www.google.com" target="_blank">Open in External Browser ↗</a>
          </div>
        </body>
      </html>`,
      {
        status: 200,
        headers: { "Content-Type": "text/html; charset=utf-8" },
      }
    );
  }
}
