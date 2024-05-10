import { Valid, preprocessFormData } from "@rvf/core";
import { Invalid } from "@rvf/core";
import { Validator } from "@rvf/core";
import { Mock } from "vitest";

function createMockValidator(
  func: (data: any) => Promise<Valid<any> | Invalid>,
): Validator<unknown> {
  return {
    validate: vi.fn(async (value: unknown) => {
      const data = preprocessFormData(value as never);
      const result = await func(data);

      if (result.error) {
        return {
          data: undefined,
          error: {
            fieldErrors: result.error,
          },
          submittedData: data,
        };
      }

      return {
        data: result.data,
        error: undefined,
        submittedData: data,
      };
    }),
  };
}

export const successValidator = createMockValidator((data) =>
  Promise.resolve({ data, error: undefined } satisfies Valid<any>),
);

afterEach(() => {
  (successValidator.validate as Mock).mockClear();
});
