import { LinkIcon } from "@heroicons/react/outline";
import classNames from "classnames";
import { useLocation } from "remix";

type PropHeaderProps = {
  variant?: "h1" | "h3";
  prop: string;
  type: string;
  optional?: boolean;
  noAnchor?: boolean;
};

const variantHeaderColors = {
  h1: "text-white",
  h3: "text-zinc-300",
};

const variantTypeSizes = {
  h1: "text-base",
  h3: "text-sm",
};

export const PropHeader = ({
  prop,
  type,
  optional,
  variant: Variant = "h3",
  noAnchor = false,
}: PropHeaderProps) => {
  const location = useLocation();
  const focusedProp = location.hash.replace("#", "");
  return (
    <Variant>
      <div className={variantHeaderColors[Variant]}>
        {noAnchor ? (
          prop
        ) : (
          <a
            id={prop}
            href={`#${prop}`}
            className={classNames(
              "-ml-6 flex items-center group",
              focusedProp !== prop && "no-underline"
            )}
          >
            <LinkIcon className="h-4 w-4 mr-2 invisible group-hover:visible" />
            {prop}
          </a>
        )}
      </div>
      <div
        className={classNames(
          "text-zinc-500",
          "whitespace-pre-wrap",
          variantTypeSizes[Variant]
        )}
      >
        {type}
      </div>
      {optional && (
        <div className="text-zinc-500 text-sm italic mt-1">
          Optional
        </div>
      )}
    </Variant>
  );
};
