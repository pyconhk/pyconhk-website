#!/usr/bin/env python3
from __future__ import annotations

import html
import json
import re
import shutil
from pathlib import Path
from urllib.parse import unquote, urlparse


CRAWL_ROOT = Path("/Users/alexau/Downloads/simply-static-1-1779119343")
REPO_ROOT = Path(__file__).resolve().parents[1]
YEARS = ("2022", "2023")
VOID_TAGS = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr"}


def find_class_tag(source: str, tag: str, class_name: str, start: int = 0) -> re.Match[str] | None:
    pattern = re.compile(rf"<{tag}\b[^>]*class=[\"'][^\"']*\b{re.escape(class_name)}\b[^\"']*[\"'][^>]*>", re.I)
    return pattern.search(source, start)


def find_matching_close(source: str, tag: str, start: int) -> int:
    token_pattern = re.compile(rf"<(/?){tag}\b[^>]*>", re.I)
    depth = 0
    for match in token_pattern.finditer(source, start):
        full_tag = match.group(0)
        is_close = bool(match.group(1))
        is_self_close = full_tag.endswith("/>") or tag.lower() in VOID_TAGS
        if is_close:
            depth -= 1
            if depth == 0:
                return match.end()
        elif not is_self_close:
            depth += 1
    raise ValueError(f"Could not find closing </{tag}>")


def extract_element(source: str, tag: str, class_name: str, start: int = 0) -> str:
    match = find_class_tag(source, tag, class_name, start)
    if not match:
        return ""
    return source[match.start() : find_matching_close(source, tag, match.start())]


def inner_html(element: str, tag: str) -> str:
    start = re.search(rf"<{tag}\b[^>]*>", element, re.I)
    end = re.search(rf"</{tag}>[\s\w<>/!.-]*$", element, re.I)
    return element[start.end() : end.start()] if start and end else element


def get_attr(tag: str, name: str) -> str:
    match = re.search(rf"\b{name}\s*=\s*([\"'])(.*?)\1", tag, re.I | re.S)
    return html.unescape(match.group(2)) if match else ""


def first_tag(source: str, tag: str) -> str:
    match = re.search(rf"<{tag}\b[^>]*>", source, re.I)
    return match.group(0) if match else ""


def strip_tags(source: str) -> str:
    text = re.sub(r"<script\b.*?</script>|<style\b.*?</style>", " ", source, flags=re.I | re.S)
    text = re.sub(r"<[^>]+>", " ", text)
    return re.sub(r"\s+", " ", html.unescape(text).replace("\xa0", " ")).strip()


def excerpt(source: str, limit: int = 220) -> str:
    text = strip_tags(source)
    return text if len(text) <= limit else text[: limit - 1].rstrip() + "..."


def meta_description(source: str) -> str:
    match = re.search(r"<meta\b(?=[^>]*name=[\"']description[\"'])[^>]*content=([\"'])(.*?)\1[^>]*>", source, re.I | re.S)
    return html.unescape(match.group(2)).strip() if match else ""


def page_title(source: str) -> str:
    match = re.search(r"<h1\b[^>]*class=[\"'][^\"']*\bentry-title\b[^\"']*[\"'][^>]*>(.*?)</h1>", source, re.I | re.S)
    if match:
        return strip_tags(match.group(1))
    match = re.search(r"<title>(.*?)</title>", source, re.I | re.S)
    return strip_tags(match.group(1)).removesuffix(" - PyCon HK").strip() if match else "Untitled"


def page_date(source: str) -> dict[str, str] | None:
    match = re.search(r"<time\b[^>]*class=[\"'][^\"']*\bentry-date\b[^\"']*[\"'][^>]*>.*?</time>", source, re.I | re.S)
    if not match:
        return None
    tag = match.group(0)
    return {"datetime": get_attr(tag, "datetime"), "label": strip_tags(tag)}


def normalize_url(value: str) -> str:
    value = html.unescape(value.strip())
    if value.startswith("//pycon.hk/"):
        value = "https:" + value
    parsed = urlparse(value)
    if parsed.netloc in {"pycon.hk", "www.pycon.hk", "legacy.pycon.hk"}:
        value = parsed.path
        if parsed.query:
            value += f"?{parsed.query}"
        if parsed.fragment:
            value += f"#{parsed.fragment}"
    return value


def upload_asset(value: str) -> str | None:
    path = unquote(urlparse(normalize_url(value)).path)
    marker = "/wp-content/uploads/"
    return path.split(marker, 1)[1].lstrip("/") if marker in path else None


def rewrite_url(page_year: str, value: str, assets: set[str]) -> str:
    value = normalize_url(value)
    asset = upload_asset(value)
    if asset:
        assets.add(asset)
        return f"/legacy-wp/{page_year}/uploads/{asset}"
    parsed = urlparse(value)
    path = unquote(parsed.path)
    if path in {f"/category/{page_year}", f"/category/{page_year}/"}:
        return f"/{page_year}/"
    if path.startswith("/category/2022/") or path.startswith("/category/2023/"):
        return f"/{path.split('/')[2]}/"
    if path.startswith("/2022/") or path.startswith("/2023/"):
        result = path if path.endswith("/") or "." in Path(path).name else f"{path}/"
        return f"{result}#{parsed.fragment}" if parsed.fragment else result
    return value


def rewrite_srcset(page_year: str, value: str, assets: set[str]) -> str:
    rewritten = []
    for candidate in value.split(","):
        bits = candidate.strip().split()
        if bits:
            bits[0] = rewrite_url(page_year, bits[0], assets)
            rewritten.append(" ".join(bits))
    return ", ".join(rewritten)


def rewrite_html(page_year: str, source: str, assets: set[str]) -> str:
    source = re.sub(r"<!--.*?-->", "", source, flags=re.S)

    def replace_attr(match: re.Match[str]) -> str:
        name, quote, value = match.group(1), match.group(2), match.group(3)
        rewritten = rewrite_srcset(page_year, value, assets) if name.lower() == "srcset" else rewrite_url(page_year, value, assets)
        return f"{name}={quote}{html.escape(rewritten, quote=True)}{quote}"

    source = re.sub(r"\b(href|src|srcset)\s*=\s*([\"'])(.*?)\2", replace_attr, source, flags=re.I | re.S)
    source = re.sub(r"\s(?:loading|decoding|fetchpriority)\s*=\s*([\"']).*?\1", "", source, flags=re.I | re.S)
    source = re.sub(r">\s+<", ">\n<", re.sub(r"\s+", " ", source))
    return source.strip()


def featured_image(page_year: str, source: str, assets: set[str]) -> dict[str, str] | None:
    tag = first_tag(extract_element(source, "div", "featured-thumbnail"), "img")
    if not tag:
        return None
    return {"src": rewrite_url(page_year, get_attr(tag, "src"), assets), "alt": get_attr(tag, "alt")}


def parse_page(page_year: str, path: Path) -> dict[str, object]:
    source = path.read_text()
    assets: set[str] = set()
    article = extract_element(source, "article", "posts-entry")
    content = inner_html(extract_element(article, "div", "entry-content"), "div")
    content_html = rewrite_html(page_year, content, assets)
    return {
        "slug": path.parent.name,
        "url": f"/{page_year}/{path.parent.name}/",
        "title": page_title(article or source),
        "description": meta_description(source) or excerpt(content_html),
        "date": page_date(article),
        "featuredImage": featured_image(page_year, source, assets),
        "contentHtml": content_html,
        "assets": sorted(assets),
    }


def parse_landing_card(page_year: str, article: str, page_by_url: dict[str, dict[str, object]], assets: set[str]) -> dict[str, object] | None:
    link = first_tag(re.search(r"<h2\b.*?</h2>", article, re.I | re.S).group(0), "a") if re.search(r"<h2\b.*?</h2>", article, re.I | re.S) else ""
    href = rewrite_url(page_year, get_attr(link, "href"), assets)
    page = page_by_url.get(href)
    if not page:
        return None
    img = first_tag(article, "img")
    image = {"src": rewrite_url(page_year, get_attr(img, "src"), assets), "alt": get_attr(img, "alt")} if img else page["featuredImage"]
    return {
        "slug": page["slug"],
        "url": page["url"],
        "title": page["title"],
        "description": excerpt(extract_element(article, "div", "entry-content")) or page["description"],
        "date": page["date"],
        "image": image,
    }


def parse_landing(page_year: str, pages: list[dict[str, object]]) -> dict[str, object]:
    page_by_url = {str(page["url"]): page for page in pages}
    assets: set[str] = set()
    cards: list[dict[str, object]] = []
    seen: set[str] = set()
    for path in sorted((CRAWL_ROOT / "category" / page_year).glob("**/index.html")):
        source = path.read_text()
        for match in re.finditer(r"<article\b[^>]*\bblogposts-list\b[^>]*>", source, re.I):
            article = source[match.start() : find_matching_close(source, "article", match.start())]
            card = parse_landing_card(page_year, article, page_by_url, assets)
            if card and str(card["slug"]) not in seen:
                seen.add(str(card["slug"]))
                cards.append(card)
    for page in pages:
        if str(page["slug"]) not in seen:
            cards.append({"slug": page["slug"], "url": page["url"], "title": page["title"], "description": page["description"], "date": page["date"], "image": page["featuredImage"]})
    return {
        "title": f"PyCon Hong Kong {page_year} Archive",
        "description": f"Archived PyCon Hong Kong {page_year} pages migrated from the legacy WordPress site.",
        "cards": cards,
        "assets": sorted(assets),
    }


def copy_assets(page_year: str, assets: set[str]) -> None:
    for asset in sorted(assets):
        source = CRAWL_ROOT / "wp-content" / "uploads" / asset
        if not source.exists():
            print(f"missing asset for {page_year}: {asset}")
            continue
        target = REPO_ROOT / "public" / "legacy-wp" / page_year / "uploads" / asset
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(source, target)


def main() -> None:
    for page_year in YEARS:
        pages = [parse_page(page_year, path) for path in sorted((CRAWL_ROOT / page_year).glob("*/index.html"))]
        landing = parse_landing(page_year, pages)
        assets = set(landing["assets"])
        for page in pages:
            assets.update(page["assets"])
            page.pop("assets", None)
        copy_assets(page_year, assets)
        landing.pop("assets", None)
        target = REPO_ROOT / "src" / "years" / page_year / "data" / "archive.json"
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(json.dumps({"year": page_year, "pages": pages, "landing": landing}, ensure_ascii=False, indent=2) + "\n")
        print(f"{page_year}: {len(pages)} pages, {len(assets)} copied asset references")


if __name__ == "__main__":
    main()
