import { Children, PropsWithChildren } from "react";
import { Tabs } from "./Tabs";

export type CodeExampleProps = PropsWithChildren<{}>;

export const CodeExample = ({
  children,
}: CodeExampleProps) => {
  if (Children.count(children) !== 2)
    throw new Error("Need example and code");
  const [example, code] = Children.toArray(children);

  return (
    <div className="not-prose code-example">
      <Tabs>
        <Tabs.List className="flex mb-4">
          <Tabs.Item>Example</Tabs.Item>
          <Tabs.Item>Code</Tabs.Item>
        </Tabs.List>
        <Tabs.Panels>
          <Tabs.Panel>{example}</Tabs.Panel>
          <Tabs.Panel>{code}</Tabs.Panel>
        </Tabs.Panels>
      </Tabs>
    </div>
  );
};
