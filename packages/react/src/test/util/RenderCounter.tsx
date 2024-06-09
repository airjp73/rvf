import { useRef } from "react";

export const useRenderCounter = () => {
  const renderCounter = useRef(0);
  renderCounter.current++;
  return renderCounter.current;
};

export const RenderCounter = ({
  "data-testid": id,
}: {
  "data-testid": string;
}) => {
  return <pre data-testid={id}>{useRenderCounter()}</pre>;
};
