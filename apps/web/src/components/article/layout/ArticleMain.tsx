import * as React from "react"

type ArticleMainProps = {
  children: React.ReactNode
}

export const ArticleMain: React.FC<ArticleMainProps> = ({ children }) => {
  return (
    <section className="flex-1 min-w-0 px-4 md:px-12">
      <div className="min-h-[calc(100vh-4rem)] md:min-h-screen flex flex-col items-center py-10 md:py-16">
        <div className="w-full max-w-2xl space-y-8">{children}</div>
      </div>
    </section>
  )
}
