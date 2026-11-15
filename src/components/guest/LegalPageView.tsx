import * as React from "react";
import { AlertTriangle } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { GUEST_CONTENT, type LegalDocument } from "@/config/guest-content";
import { cn } from "@/lib/utils";

export interface LegalPageViewProps {
  document: LegalDocument;
  className?: string;
}

export function LegalPageView({ document, className }: { document: LegalDocument; className?: string }) {
  const isReviewed = GUEST_CONTENT.legalReviewed;
  const draftNotice = GUEST_CONTENT.legalDraftNotice;

  return (
    <article
      className={cn(
        "mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8",
        className
      )}
    >
      {/* 1. Legal Review Banner (displayed while legalReviewed is false) */}
      {!isReviewed && (
        <Alert
          variant="warning"
          className="mb-8 rounded-md border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-200 print:hidden"
          data-testid="legal-draft-banner"
        >
          <AlertTriangle className="size-5 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden="true" />
          <div className="ml-2">
            <AlertTitle className="text-sm font-semibold">
              {draftNotice.title}
            </AlertTitle>
            <AlertDescription className="text-xs mt-1 text-amber-800/90 dark:text-amber-300/90">
              {draftNotice.message}
            </AlertDescription>
          </div>
        </Alert>
      )}

      {/* 2. Document Header */}
      <header className="border-b border-border pb-8 mb-8 space-y-3">
        <h1
          id="legal-doc-title"
          className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl"
        >
          {document.title}
        </h1>
        <p className="text-xs text-muted-foreground uppercase tracking-wider">
          Last Updated: {document.lastUpdated}
        </p>
        <p className="text-sm text-muted-foreground sm:text-base leading-relaxed pt-1">
          {document.description}
        </p>
      </header>

      {/* 3. Anchor List (Table of Contents) */}
      <nav
        aria-label="Table of contents"
        className="mb-10 print:hidden"
      >
        <Card className="rounded-md border border-border bg-surface/40 shadow-none">
          <CardHeader className="py-3 px-4 border-b border-border/50">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Contents
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <ol className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {document.sections.map((sec) => (
                <li key={sec.id}>
                  <a
                    href={`#${sec.id}`}
                    className="text-muted-foreground hover:text-primary transition-colors underline-offset-4 hover:underline"
                  >
                    {sec.title}
                  </a>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      </nav>

      {/* 4. Sections Body */}
      <div className="prose prose-neutral dark:prose-invert max-w-3xl space-y-10 text-foreground">
        {document.sections.map((section) => (
          <section
            key={section.id}
            id={section.id}
            aria-labelledby={`heading-${section.id}`}
            className="scroll-mt-24 space-y-3"
          >
            <h2
              id={`heading-${section.id}`}
              className="text-xl font-semibold tracking-tight text-foreground border-b border-border/40 pb-2"
            >
              {section.title}
            </h2>
            <div className="space-y-3 text-sm sm:text-base text-muted-foreground leading-relaxed">
              {section.paragraphs.map((para, idx) => {
                const isTbc = para.includes("[TO BE CONFIRMED");
                return (
                  <p
                    key={idx}
                    className={cn(
                      isTbc &&
                        "rounded-md border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-xs sm:text-sm font-medium text-amber-900 dark:text-amber-200"
                    )}
                  >
                    {para}
                  </p>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </article>
  );
}
