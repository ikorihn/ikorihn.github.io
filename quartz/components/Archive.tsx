import { QuartzComponentConstructor, QuartzComponentProps } from "./types"
import style from "./styles/recentNotes.scss"
import { Data } from "vfile"
import { pathToRoot } from "../util/path"

export default (() => {
  function Archive({ allFiles, displayClass, fileData }: QuartzComponentProps) {
    const pagesByYear = allFiles.reduce((obj: { [key: number]: Data[] }, file) => {
      const key = file.dates?.created.getFullYear()
      if (key == null) {
        return obj
      }
      ;(obj[key] || (obj[key] = []))!.push(file)
      return obj
    }, {})

    const baseDir = pathToRoot(fileData.slug!)

    return (
      <div class={`recent-notes ${displayClass}`}>
        <h3>Archive</h3>
        <ul class="recent-ul">
          {Object.entries(pagesByYear).map(([year, pages]) => {
            const display = `${year}(${pages.length})`
            const linkDest = baseDir + `/archive/${year}`
            return (
              <li class="recent-li">
                <div class="section">
                  <div class="desc">
                    <a href={linkDest} class="internal">
                      {display}
                    </a>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    )
  }

  Archive.css = style
  return Archive
}) satisfies QuartzComponentConstructor
