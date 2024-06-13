import { useForm } from "@rvf/react";
import { withZod } from "@rvf/zod";
import { z } from "zod";

const validator = withZod(
  z.object({
    // projectName: z
    //   .string()
    //   .min(1, "Projects need a name.")
    //   .max(50, "Must be 50 characters or less."),
    // tasks: z.array(
    //   z.object({
    //     title: z
    //       .string()
    //       .min(1, "Tasks need a title.")
    //       .max(50, "Must be 50 characters or less."),
    //     description: z.string().max(500, "Must be 500 characters or less."),
    //   }),
    // ),
  }),
);

export const ReactExample = () => {
  // const form = useForm({ validator });
  return <form></form>;
};
