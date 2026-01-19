export const DISPLAY_ORDERS = ["native_first", "target_first"] as const
export type DisplayOrder = (typeof DISPLAY_ORDERS)[number]
