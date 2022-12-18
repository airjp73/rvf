import {
  ArrowLeftIcon,
  ArrowRightIcon,
} from "@heroicons/react/outline";
import { Link } from "@remix-run/react";
import classNames from "classnames";

type FooterProps = {
  next?: {
    to: string;
    label: string;
  };
  prev?: {
    to: string;
    label: string;
  };
  className?: string;
};

export const Footer = ({
  next,
  prev,
  className,
}: FooterProps) => {
  return (
    <footer
      className={classNames(
        "flex items-center justify-between",
        className
      )}
    >
      {prev ? (
        <Link
          to={prev.to}
          className="flex items-center space-x-2"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          <span>{prev.label}</span>
        </Link>
      ) : (
        <div />
      )}
      {next && (
        <Link
          to={next.to}
          className="flex items-center space-x-2"
        >
          <span>{next.label}</span>
          <ArrowRightIcon className="h-4 w-4" />
        </Link>
      )}
    </footer>
  );
};
