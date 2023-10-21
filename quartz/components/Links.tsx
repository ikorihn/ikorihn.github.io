import { QuartzComponentConstructor, QuartzComponentProps } from "./types"

import style from "./styles/search.scss"

export default (() => {
  function Links({ cfg }: QuartzComponentProps) {
    return (
      <div style="display: flex; gap: 30px 20px;">
        <div>
          <a href={"https://" + cfg.baseUrl + "/note"} class="font-bold underline text-gray-400">
            NOTES
          </a>
        </div>
        <div>
          <a href={"https://" + cfg.baseUrl + "/blog"} class="font-bold underline text-gray-400">
            BLOG
          </a>
        </div>
      </div>
    )
  }
  Links.css = style

  return Links
}) satisfies QuartzComponentConstructor
