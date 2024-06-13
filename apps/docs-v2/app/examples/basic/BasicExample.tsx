import { Tabs } from "@radix-ui/react-tabs";
import {
  CodeHeader,
  CodePanel,
  CodeTabsList,
  CodeTabsTrigger,
  CopyButton,
  ExampleArea,
} from "~/ui/mdx/Code";
import { ReactExample } from "./react";
import WithReact from "./react?code";
import withReactText from "./react?raw";
import WithRemix from "./remix?code";
import withRemixText from "./remix?raw";

export const BasicExample = () => {
  return (
    <Tabs defaultValue="example">
      <ExampleArea>
        <CodeHeader
          title="Demo form"
          tabs={
            <CodeTabsList>
              <CodeTabsTrigger value="example">Example</CodeTabsTrigger>
              <CodeTabsTrigger value="with-react">React</CodeTabsTrigger>
              <CodeTabsTrigger value="with-remix">Remix</CodeTabsTrigger>
            </CodeTabsList>
          }
        />
        <CodePanel value="example">
          <div className="py-6 px-8 [&_form]:space-y-6 [&_ul]:space-y-8 [&_li]:flex [&_li]:items-end [&_li]:gap-4 [&_li_:not(button)]:grow">
            <ReactExample />
          </div>
        </CodePanel>
        <CodePanel
          value="with-react"
          copyButton={<CopyButton content={withReactText} />}
        >
          <WithReact />
        </CodePanel>
        <CodePanel
          value="with-remix"
          copyButton={<CopyButton content={withRemixText} />}
        >
          <WithRemix />
        </CodePanel>
      </ExampleArea>
    </Tabs>
  );
};
