import { PageLayout, SharedLayout } from "./quartz/cfg"
import * as Component from "./quartz/components"

// components shared across all pages
export const sharedPageComponents: SharedLayout = {
  head: Component.Head(),
  header: [],
  footer: Component.Footer({
    links: {
      GitHub: "https://github.com/ikorihn",
      Zenn: "https://zenn.dev/r57ty7",
      X: "https://twitter.com/r57ty7",
      Bluesky: "https://bsky.app/profile/ikorihn.bsky.social",
    },
  }),
}

const left = [
  Component.PageTitle(),
  Component.MobileOnly(Component.Spacer()),
  Component.Search(),
  Component.Darkmode(),
  Component.DesktopOnly(
    Component.Explorer({
      filterFn: (node) => node.file?.slug !== "index",
    }),
  ),
  Component.DesktopOnly(
    Component.RecentNotes({
      limit: 20,
    }),
  ),
]

// components for pages that display a single page (e.g. a single note)
export const defaultContentPageLayout: PageLayout = {
  beforeBody: [
    Component.Breadcrumbs(),
    Component.ArticleTitle(),
    Component.ContentMeta(),
    Component.TagList(),
    Component.MobileOnly(Component.TableOfContents()),
  ],
  left,
  right: [
    Component.DesktopOnly(Component.TableOfContents()),
    Component.Graph({
      localGraph: {
        depth: 3, // how many hops of notes to display
        linkDistance: 15, // how long should the links be by default?
      },
      globalGraph: {},
    }),
    Component.Backlinks(),
    Component.Archive(),
  ],
}

// components for pages that display lists of pages  (e.g. tags or folders)
export const defaultListPageLayout: PageLayout = {
  beforeBody: [Component.Breadcrumbs(), Component.ArticleTitle(), Component.ContentMeta()],
  left,
  right: [],
}
