import { QuartzComponentConstructor, QuartzComponentProps } from "../types"
import { Fragment, jsx, jsxs } from "preact/jsx-runtime"
import { toJsxRuntime } from "hast-util-to-jsx-runtime"
import path from "path"

import style from "../styles/listPage.scss"
import { PageList } from "../PageList"
import { FullSlug, _stripSlashes, simplifySlug } from "../../util/path"
import { Root } from "hast"

function ArchiveContent(props: QuartzComponentProps) {
  const { tree, fileData, allFiles } = props
  const slug = fileData.slug
  if (!slug?.startsWith("archive/")) {
    throw new Error(`Component "ArchiveContent" tried to render a non-archive page: ${slug}`)
  }
  const yearSlug = simplifySlug(slug.slice("archive/".length) as FullSlug)

  const year = parseInt(yearSlug)

  const allPagesInYear = allFiles.filter((file) => {
    const y = file.dates?.created.getFullYear()
    return year === y
  })

  const listProps = {
    ...props,
    allFiles: allPagesInYear,
  }

  const content =
    (tree as Root).children.length === 0
      ? fileData.description
      : // @ts-ignore
        toJsxRuntime(tree, { Fragment, jsx, jsxs, elementAttributeNameCase: "html" })

  return (
    <div class="popover-hint">
      <article>
        <p>{content}</p>
      </article>
      <p>{allPagesInYear.length} items in this year.</p>
      <div>
        <PageList {...listProps} />
      </div>
    </div>
  )
}

ArchiveContent.css = style + PageList.css
export default (() => ArchiveContent) satisfies QuartzComponentConstructor
