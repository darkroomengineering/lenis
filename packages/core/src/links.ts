// links with a valid href attribute in the path of a click
function getLinkUrls(event: Event) {
  return event
    .composedPath()
    .filter(
      (node): node is HTMLAnchorElement =>
        node instanceof HTMLAnchorElement && Boolean(node.href)
    )
    .map((element) => new URL(element.href))
}

/**
 * Get the hash of a clicked link that points to the current page
 */
export function getAnchorTarget(event: Event) {
  const currentUrl = new URL(window.location.href)
  const url = getLinkUrls(event).find(
    (targetUrl) =>
      currentUrl.host === targetUrl.host &&
      currentUrl.pathname === targetUrl.pathname &&
      targetUrl.hash
  )

  // hash is URL-encoded (e.g. `#footnote-%E2%80%A0`); decode so it
  // matches the raw HTML id in scrollTo's getElementById
  return url && decodeURIComponent(url.hash)
}

/**
 * Check if a clicked link points to another page of the same site
 */
export function isPageNavigation(event: Event) {
  const currentUrl = new URL(window.location.href)

  return getLinkUrls(event).some(
    (targetUrl) =>
      currentUrl.host === targetUrl.host &&
      currentUrl.pathname !== targetUrl.pathname
  )
}
