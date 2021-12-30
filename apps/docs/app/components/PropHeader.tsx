import classNames from "classnames";

type PropHeaderProps = {
  variant?: "h1" | "h3";
  prop: string;
  type: string;
  optional?: boolean;
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
}: PropHeaderProps) => {
  return (
    <Variant>
      <div className={variantHeaderColors[Variant]}>
        {prop}
      </div>
      <div
        className={classNames(
          "text-zinc-500",
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
