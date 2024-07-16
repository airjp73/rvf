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
import Code from "./react?code";
import codeContent from "./react?raw";
import { cn } from "~/lib/utils";

export const StateMode = () => {
  return (
    <Tabs defaultValue="example">
      <ExampleArea>
        <CodeHeader
          title="Demo form"
          tabs={
            <CodeTabsList>
              <CodeTabsTrigger value="example">Example</CodeTabsTrigger>
              <CodeTabsTrigger value="code">Code</CodeTabsTrigger>
            </CodeTabsList>
          }
        />
        <CodePanel value="example">
          <div
            className={cn(
              "py-6 px-8 [&_form]:space-y-10 [&_ul]:space-y-6 [&_li]:flex [&_li]:items-end [&_li]:gap-4 [&_li_:not(button)]:grow [&_h3]:text-lg [&_h3]:font-semibold [&_hr]:mt-2 [&_hr]:mb-4",
              "[&_div:has([data-input])]:flex [&_div:has([data-input])]:gap-4 [&_div:has([data-input])>*]:grow",
              "[&_fieldset]:flex [&_fieldset]:gap-4 [&_fieldset]:flex-col",
            )}
          >
            <ReactExample />
          </div>
        </CodePanel>
        <CodePanel
          value="code"
          copyButton={<CopyButton content={codeContent} />}
        >
          <Code />
        </CodePanel>
      </ExampleArea>
    </Tabs>
  );
};
