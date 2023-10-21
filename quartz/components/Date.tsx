import { GlobalConfiguration } from "../cfg"
import { ValidLocale } from "../i18n"
import { QuartzPluginData } from "../plugins/vfile"

interface Props {
  date: Date
  locale?: ValidLocale
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

export function formatDate(d: Date, locale: ValidLocale = "en-US"): string {
  const y = d.getFullYear()
  const m = ("00" + (d.getMonth() + 1)).slice(-2)
  const day = ("00" + d.getDate()).slice(-2)

  return `${y}-${m}-${day}`
}

export function Date({ date, locale, updated }: Props) {
  const dateStr = formatDate(date, locale)
  const updatedStr = updated ? formatDate(updated) : undefined
  return (
    <>
      {dateStr} {updatedStr != null && dateStr !== updatedStr && `(edited ${updatedStr})`}
    </>
  )
}
