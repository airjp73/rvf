import {
  ArrowLeftIcon,
  ArrowRightIcon,
} from "@heroicons/react/outline";
import { Link } from "remix";

type FooterProps = {
  next?: {
    to: string;
    label: string;
  };
  prev?: {
    to: string;
    label: string;
  };
};

export const Footer = ({ next, prev }: FooterProps) => {
  return (
    <footer className="flex items-center justify-between">
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
