import { Tabs, TabList, Tab, TabPanels, TabPanel } from "@chakra-ui/react";
import { Children, FC } from "react";

type CodeExampleProps = {
  title: string;
};

export const CodeExample: FC<CodeExampleProps> = ({ children, title }) => {
  if (Children.count(children) !== 2) throw new Error("Need example and code");
  const [example, code] = Children.toArray(children);

  return (
    <div className="not-prose code-example">
      <Tabs variant="soft-rounded">
        <TabList>
          <Tab>Example</Tab>
          <Tab>Code</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>{example}</TabPanel>
          <TabPanel>{code}</TabPanel>
        </TabPanels>
      </Tabs>
    </div>
  );
};
