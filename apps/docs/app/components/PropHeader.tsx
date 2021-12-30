type PropHeaderProps = {
  prop: string;
  type: string;
  optional?: boolean;
};

export const PropHeader = ({
  prop,
  type,
  optional,
}: PropHeaderProps) => {
  return (
    <h3>
      <div className="text-zinc-300">{prop}</div>
      <div className="text-zinc-500 text-sm">{type}</div>
      {optional && (
        <div className="text-zinc-500 text-sm italic mt-1">
          Optional
        </div>
      )}
    </h3>
  );
};
