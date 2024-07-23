"use client";

import { Link, useLocation } from "@remix-run/react";
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";

const flatNavLinks = []; //navigation.flatMap((item) => item.links);

function PageNavigation() {
  const location = useLocation();

  const currentPageIndex = flatNavLinks.findIndex(
    (link) => link.href === location.pathname,
  );
  const prevPage = flatNavLinks[currentPageIndex - 1];
  const nextPage = flatNavLinks[currentPageIndex + 1];

  if (!prevPage && !nextPage) {
    return null;
  }

  return (
    <div className="flex border-t border-zinc-900/10 pt-8 dark:border-white/10">
      {prevPage && (
        <div className="flex flex-col items-end gap-3">
          <Link
            to={prevPage.href}
            className="flex items-center gap-2"
            prefetch="intent"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            <span>{prevPage.title}</span>
          </Link>
        </div>
      )}
      {nextPage && (
        <div className="flex flex-col items-start gap-3 ml-auto">
          <Link
            to={nextPage.href}
            className="flex items-center gap-2 ml-auto"
            prefetch="intent"
          >
            <span>{nextPage.title}</span>
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>
      )}
    </div>
  );
}

export function Footer() {
  return (
    <footer className="mx-auto w-full max-w-2xl space-y-10 pb-16 lg:max-w-5xl">
      <PageNavigation />
    </footer>
  );
}
