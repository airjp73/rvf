import { Tab } from "@headlessui/react";
import classNames from "classnames";
import { ComponentType, FC } from "react";

type ExtractProps<T> = T extends ComponentType<infer P>
  ? P
  : T;

type TabsType = FC<ExtractProps<typeof Tab.Group>> & {
  List: FC<ExtractProps<typeof Tab.List>>;
  Item: FC<ExtractProps<typeof Tab>>;
  Panels: FC<ExtractProps<typeof Tab.Panels>>;
  Panel: FC<ExtractProps<typeof Tab.Panel>>;
};

export const Tabs: TabsType = (props) => (
  <Tab.Group {...props} />
);

const TabItem: TabsType["Item"] = ({
  className,
  ...rest
}) => (
  <Tab
    className={({ selected }: any) =>
      classNames(
        selected
          ? "bg-indigo-100 text-indigo-700"
          : "text-gray-300 hover:text-indigo-300 hover:outline-indigo-3 hover:outline",
        "px-3 py-2 font-medium text-sm rounded-md",
        "flex-1",
        className
      )
    }
    {...rest}
  />
);
Tabs.Item = TabItem;

Tabs.List = Tab.List;
Tabs.Panel = Tab.Panel;
Tabs.Panels = Tab.Panels;
