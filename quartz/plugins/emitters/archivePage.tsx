import { QuartzEmitterPlugin } from "../types"
import { QuartzComponentProps } from "../../components/types"
import HeaderConstructor from "../../components/Header"
import BodyConstructor from "../../components/Body"
import { pageResources, renderPage } from "../../components/renderPage"
import { ProcessedContent, defaultProcessedContent } from "../vfile"
import { FullPageLayout } from "../../cfg"
import { FilePath, FullSlug, _stripSlashes, joinSegments } from "../../util/path"
import { defaultListPageLayout, sharedPageComponents } from "../../../quartz.layout"
import ArchiveContent from "../../components/pages/ArchiveContent"

export const ArchivePage: QuartzEmitterPlugin<FullPageLayout> = (userOpts) => {
  const opts: FullPageLayout = {
    ...sharedPageComponents,
    ...defaultListPageLayout,
    pageBody: ArchiveContent(),
    ...userOpts,
  }

  const { head: Head, header, beforeBody, pageBody, left, right, footer: Footer } = opts
  const Header = HeaderConstructor()
  const Body = BodyConstructor()

  return {
    name: "ArchivePage",
    getQuartzComponents() {
      return [Head, Header, Body, ...header, ...beforeBody, pageBody, ...left, ...right, Footer]
    },
    async emit(ctx, content, resources, emit): Promise<FilePath[]> {
      const fps: FilePath[] = []
      const allFiles = content.map((c) => c[1].data)
      const cfg = ctx.cfg.configuration

      const years: Set<number> = new Set(
        allFiles.map((data) => data.dates?.created ?? new Date(0)).map((d) => d.getFullYear()),
      )

      const yearPages: Record<string, ProcessedContent> = Object.fromEntries(
        [...years].map((year) => {
          return [
            year,
            defaultProcessedContent({
              slug: joinSegments("archive", year.toString()) as FullSlug,
              frontmatter: { title: year.toString(), tags: [] },
            }),
          ]
        }),
      )

      for (const [tree, file] of content) {
        const slug = file.data.slug!
        if (slug.startsWith("archive/")) {
          yearPages[slug] = [tree, file]
        }
      }

      for (const year of years) {
        const slug = joinSegments("archive", year.toString()) as FullSlug
        const externalResources = pageResources(slug, resources)
        const [tree, file] = yearPages[year]
        const componentData: QuartzComponentProps = {
          fileData: file.data,
          externalResources,
          cfg,
          children: [],
          tree,
          allFiles,
        }

        const content = renderPage(slug, componentData, opts, externalResources)
        const fp = await emit({
          content,
          slug: file.data.slug!,
          ext: ".html",
        })

        fps.push(fp)
      }
      return fps
    },
  }
}
