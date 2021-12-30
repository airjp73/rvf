type PropHeaderProps = {
  variant?: "h1" | "h3";
  prop: string;
  type: string;
  optional?: boolean;
};

export const PropHeader = ({
  prop,
  type,
  optional,
  variant: Variant = "h3",
}: PropHeaderProps) => {
  return (
    <Variant>
      <div className="text-zinc-300">{prop}</div>
      <div className="text-zinc-500 text-sm">{type}</div>
      {optional && (
        <div className="text-zinc-500 text-sm italic mt-1">
          Optional
        </div>
      )}
    </Variant>
  );
};
