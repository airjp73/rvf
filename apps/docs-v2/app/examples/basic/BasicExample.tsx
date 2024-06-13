import { Tabs } from "@radix-ui/react-tabs";
import {
  Code,
  CodeHeader,
  CodePanel,
  CodeTabsList,
  CodeTabsTrigger,
  CopyButton,
  ExampleArea,
} from "~/ui/mdx/Code";
import { ReactExample } from "./with-animation";
import WithAnimation from "./with-animation?code";
import withAnimationText from "./with-animation?raw";
import NoAnimation from "./no-animation?code";
import noAnimationText from "./no-animation?raw";

export const BasicExample = () => {
  return (
    <Tabs defaultValue="example">
      <ExampleArea>
        <CodeHeader
          title="Demo form"
          tabs={
            <CodeTabsList>
              <CodeTabsTrigger value="example">Example</CodeTabsTrigger>
              <CodeTabsTrigger value="with-animation">
                With animation
              </CodeTabsTrigger>
              <CodeTabsTrigger value="no-animation">
                No animation
              </CodeTabsTrigger>
            </CodeTabsList>
          }
        />
        <CodePanel value="example">
          <div className="p-4">
            <ReactExample />
          </div>
        </CodePanel>
        <CodePanel
          value="with-animation"
          copyButton={<CopyButton content={withAnimationText} />}
        >
          <WithAnimation />
        </CodePanel>
        <CodePanel
          value="no-animation"
          copyButton={<CopyButton content={noAnimationText} />}
        >
          <NoAnimation />
        </CodePanel>
      </ExampleArea>
    </Tabs>
  );
};
