import archiveLinkData from './conference-archive-links.json';
import { legacyHighlightNavLinks } from './year-highlights';

export interface ConferenceArchiveLink {
  href: string;
  label: string;
  shortLabel: string;
}

export const conferenceArchiveLinks =
  archiveLinkData as readonly ConferenceArchiveLink[];

export const conferenceArchiveNavItems = conferenceArchiveLinks.map(
  ({ href, label }) => ({
    href,
    label,
  })
);

export const conferenceArchiveHistoryLinks = conferenceArchiveLinks.map(
  ({ href, shortLabel }) => ({
    href,
    label: shortLabel,
  })
);

const legacy2015Host = ['2015', 'pycon', 'hk'].join('.');

export function localizeConferenceArchiveHtmlLinks(html: string) {
  return html.replace(
    /(\shref=)(["'])(https?:\/\/[^"']+)\2/giu,
    (match, prefix: string, quote: string, href: string) => {
      const localHref = localConferenceArchiveHref(href);

      return localHref ? `${prefix}${quote}${localHref}${quote}` : match;
    }
  );
}

export function repairLegacy2017ArchiveSidebar(html: string) {
  const archiveSidebar = [
    '<li class="no-padding">',
    '<ul class="collapsible collapsible-accordion">',
    '<li>',
    '<a href="#" class="bold waves-effect collapsible-header">Archive</a>',
    '<div class="collapsible-body">',
    '<ul>',
    ...conferenceArchiveLinks.map(
      ({ href, label }) =>
        `<li><a href="${escapeHtml(href)}">${escapeHtml(label)}</a></li>`
    ),
    '<li><a href="http://python.hk/" target="_blank" rel="noopener noreferrer">Python HK</a></li>',
    '</ul>',
    '</div>',
    '</li>',
    '</ul>',
    '</li>',
  ].join('');

  return localizeConferenceArchiveHtmlLinks(html).replace(
    /<li class="no-padding">\s*<ul class="collapsible collapsible-accordion">\s*<li>\s*<a href="#" class="bold waves-effect collapsible-header">Archive<\/a>\s*<div class="collapsible-body">\s*<ul>[\s\S]*?<\/ul>\s*<\/div>\s*<\/li>\s*<\/ul>\s*<\/li>/u,
    archiveSidebar
  );
}

export function repairLegacyWordPressHistoryLinks(html: string) {
  return localizeConferenceArchiveHtmlLinks(html).replace(
    /(<section\b[^>]*>\s*<h3>History<\/h3>\s*)<p>[\s\S]*?<\/p>(\s*<\/section>)/u,
    (_match, prefix: string, suffix: string) =>
      `${prefix}${conferenceArchiveHistoryParagraphHtml()}${suffix}`
  );
}

export function repairLegacyWordPressHighlightNav(html: string) {
  const latestHighlightHref = legacyHighlightNavLinks[0]?.href ?? '/2024/photos';
  const highlightMenu = [
    '<li id="menu-item-2959" class="menu-item menu-item-type-custom menu-item-object-custom menu-item-has-children menu-item-2959">',
    `<a href="${escapeHtml(latestHighlightHref)}">Conference Highlights</a>`,
    '<ul class="sub-menu">',
    ...legacyHighlightNavLinks.map(
      ({ href, label }) =>
        `<li class="menu-item"><a href="${escapeHtml(href)}">${escapeHtml(label)}</a></li>`
    ),
    '</ul>',
    '</li>',
  ].join('');

  return html.replace(
    /<li\b(?=[^>]*\bmenu-item\b)(?![^>]*\bmenu-item-has-children\b)[^>]*>\s*<a\b[^>]*href=(["'])(?:https?:\/\/(?:www\.)?pycon\.hk)?\/(?:conference-highlights\/?|2018\/photos\/?|2024\/photos\/?)\1[^>]*>\s*Conference Highlights\s*<\/a>\s*<\/li>/u,
    highlightMenu
  );
}

function localConferenceArchiveHref(href: string) {
  let url: URL;

  try {
    url = new URL(href);
  } catch {
    return undefined;
  }

  if (url.hostname === legacy2015Host && rootPath(url.pathname)) {
    return `/2015/${url.hash}`;
  }

  if (!['legacy.pycon.hk', 'pycon.hk', 'www.pycon.hk'].includes(url.hostname)) {
    return undefined;
  }

  const pathname = url.pathname.endsWith('/') ? url.pathname : `${url.pathname}/`;
  const archiveLink = conferenceArchiveLinks.find((link) => link.href === pathname);

  return archiveLink ? `${archiveLink.href}${url.hash}` : undefined;
}

function rootPath(pathname: string) {
  return pathname === '' || pathname === '/';
}

function conferenceArchiveHistoryParagraphHtml() {
  return `<p>${conferenceArchiveHistoryLinks
    .map(({ href, label }, index) => {
      const breakBefore = index === 6 ? '<br>' : '';
      const separator = index === conferenceArchiveHistoryLinks.length - 1 ? '' : '  ';

      return `${breakBefore}<a href="${escapeHtml(href)}">${escapeHtml(label)}</a>${separator}`;
    })
    .join('')}</p>`;
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/gu, (character) => {
    switch (character) {
      case '&':
        return '&amp;';
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '"':
        return '&quot;';
      case "'":
        return '&#39;';
      default:
        return character;
    }
  });
}
