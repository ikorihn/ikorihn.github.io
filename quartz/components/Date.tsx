import { GlobalConfiguration } from "../cfg"
import { QuartzPluginData } from "../plugins/vfile"

interface Props {
  date: Date
  updated?: Date
}

export type ValidDateType = keyof Required<QuartzPluginData>["dates"]

export function getDate(cfg: GlobalConfiguration, data: QuartzPluginData): Date | undefined {
  if (!cfg.defaultDateType) {
    throw new Error(
      `Field 'defaultDateType' was not set in the configuration object of quartz.config.ts. See https://quartz.jzhao.xyz/configuration#general-configuration for more details.`,
    )
  }
  return data.dates?.[cfg.defaultDateType]
}

export function formatDate(d: Date): string {
  return d
    .toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
    .replaceAll("/", "-")
}

export function Date({ date, updated }: Props) {
  const dateStr = formatDate(date)
  const updatedStr = updated ? formatDate(updated) : undefined
  return (
    <>
      {dateStr} {updatedStr != null && dateStr !== updatedStr && `(edited ${updatedStr})`}
    </>
  )
}
