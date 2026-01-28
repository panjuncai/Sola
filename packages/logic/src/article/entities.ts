import type { ArticleDetail, ArticleSentence, DisplayOrder } from "@sola/shared"

import { deriveTitle } from "./content-parser.js"

export type SentenceRole = "native" | "target"

export type SentenceLike = Pick<ArticleSentence, "id" | "nativeText" | "targetText">

export type ArticleLike = {
  id: ArticleDetail["id"]
  title?: ArticleDetail["title"]
  content?: ArticleDetail["content"]
  displayOrder?: ArticleDetail["displayOrder"] | DisplayOrder | null
}

const roleOrder = (displayOrder: DisplayOrder): SentenceRole[] =>
  displayOrder === "native_first" ? ["native", "target"] : ["target", "native"]

const normalizeDisplayOrder = (value?: DisplayOrder | string | null): DisplayOrder =>
  value === "target_first" ? "target_first" : "native_first"

export class SentenceEntity {
  private readonly sentence: SentenceLike

  constructor(sentence: SentenceLike) {
    this.sentence = sentence
  }

  get id() {
    return this.sentence.id
  }

  getText(role: SentenceRole) {
    return role === "native"
      ? this.sentence.nativeText ?? ""
      : this.sentence.targetText ?? ""
  }

  hasText(role: SentenceRole) {
    return this.getText(role).trim().length > 0
  }

  isPlayable(role: SentenceRole) {
    return this.hasText(role)
  }

  canCloze() {
    return this.hasText("target")
  }

  getDisplayRoles(displayOrder: DisplayOrder): SentenceRole[] {
    const ordered = roleOrder(displayOrder)
    return ordered.filter((role) => this.hasText(role))
  }

  getPrimaryRole(displayOrder: DisplayOrder): SentenceRole {
    const ordered = roleOrder(displayOrder)
    return ordered.find((role) => this.hasText(role)) ?? "native"
  }

  toDisplayItems(displayOrder: DisplayOrder) {
    return this.getDisplayRoles(displayOrder).map((role) => ({
      role,
      text: this.getText(role),
    }))
  }
}

export class ArticleEntity {
  private readonly article: ArticleLike

  constructor(article: ArticleLike) {
    this.article = article
  }

  get id() {
    return this.article.id
  }

  getDisplayOrder(): DisplayOrder {
    return normalizeDisplayOrder(this.article.displayOrder)
  }

  getTitle() {
    const title = this.article.title?.trim()
    if (title) return title
    const content = this.article.content?.trim()
    return content ? deriveTitle(content) : null
  }

  hasPlayableSentence(sentences: SentenceLike[], role?: SentenceRole) {
    return sentences.some((sentence) => {
      const entity = new SentenceEntity(sentence)
      return role ? entity.isPlayable(role) : entity.isPlayable("native") || entity.isPlayable("target")
    })
  }
}
