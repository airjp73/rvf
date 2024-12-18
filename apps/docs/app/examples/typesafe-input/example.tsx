import { Tabs } from "@radix-ui/react-tabs";
import {
  CodeHeader,
  CodePanel,
  CodeTabsList,
  CodeTabsTrigger,
  CopyButton,
  ExampleArea,
} from "~/ui/mdx/Code";
import { InputTypes } from "./react";
import WithReact from "./react?code";
import withReactText from "./react?raw";

export const TypesafeInput = () => {
  return (
    <Tabs defaultValue="preview">
      <ExampleArea>
        <CodeHeader
          title="One component for different input types"
          tabs={
            <CodeTabsList>
              <CodeTabsTrigger value="preview">
                Preview
              </CodeTabsTrigger>
              <CodeTabsTrigger value="code">
                Code
              </CodeTabsTrigger>
            </CodeTabsList>
          }
        />
        <CodePanel value="preview">
          <div className="py-6 px-8 [&_form]:space-y-6 [&_ul]:space-y-6 [&_li]:flex [&_li]:items-end [&_li]:gap-4 [&_li_:not(button)]:grow [&_h3]:text-lg [&_h3]:font-semibold [&_hr]:mt-2 [&_hr]:mb-4">
            <InputTypes />
          </div>
        </CodePanel>
        <CodePanel
          value="code"
          copyButton={
            <CopyButton content={withReactText} />
          }
        >
          <WithReact />
        </CodePanel>
      </ExampleArea>
    </Tabs>
  );
};
