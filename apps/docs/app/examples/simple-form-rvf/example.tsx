import { Tabs } from "@radix-ui/react-tabs";
import {
  CodeHeader,
  CodePanel,
  CodeTabsList,
  CodeTabsTrigger,
  CopyButton,
  ExampleArea,
} from "~/ui/mdx/Code";
import { SignupForm } from "./react";
import WithReact from "./react?code";
import withReactText from "./react?raw";

export const SimpleForm = () => {
  return (
    <Tabs defaultValue="example">
      <ExampleArea>
        <CodeHeader
          title="Simple, native form"
          tabs={
            <CodeTabsList>
              <CodeTabsTrigger value="example">
                Example
              </CodeTabsTrigger>
              <CodeTabsTrigger value="with-react">
                Code
              </CodeTabsTrigger>
            </CodeTabsList>
          }
        />
        <CodePanel value="example">
          <div className="py-6 px-8 [&_form]:space-y-6 [&_ul]:space-y-6 [&_li]:flex [&_li]:items-end [&_li]:gap-4 [&_li_:not(button)]:grow [&_h3]:text-lg [&_h3]:font-semibold [&_hr]:mt-2 [&_hr]:mb-4">
            <SignupForm />
          </div>
        </CodePanel>
        <CodePanel
          value="with-react"
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
