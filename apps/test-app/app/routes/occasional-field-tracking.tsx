import { withZod } from "@rvf/zod";
import { useEffect } from "react";
import { ValidatedForm, useControlField } from "@rvf/remix";
import { z } from "zod";
import { zfd } from "zod-form-data";

const validator = withZod(
  z.object({
    token: zfd.text(),
  }),
);

export default function OccasionalFieldTracking() {
  const [value, setValue] = useControlField<string>("token", "test-form");

  useEffect(() => {
    setValue("set-on-mount");
  }, [setValue]);

  return (
    <ValidatedForm id="test-form" validator={validator} method="post">
      <input data-testid="occasional" name="token" value={value} />
    </ValidatedForm>
  );
}
