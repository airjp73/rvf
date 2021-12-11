import {
  Box,
  Button,
  Stack,
  HStack,
  Container,
  VStack,
} from "@chakra-ui/react";
import { useState } from "react";
import { useNavigate } from "remix";
import * as z from "zod";
import {
  ValidatedForm,
  withZod,
  useIsSubmitting,
} from "../../remix-validated-form";
import { FormInput } from "./FormInput";
import { FormSelect } from "./FormSelect";

const subjectSchema = z.object({
  id: z.number().optional(),
  name: z.string().nonempty("Subject Name can't be empty"),
  description: z.string().nonempty("Subject Description can't be empty"),
  teacher: z.object({
    id: z.number().optional(),
    name: z.string().nonempty("Teacher Name can't be empty"),
    email: z
      .string()
      .email("Teacher Email is invalid")
      .nonempty("Teacher Email can't be empty"),
  }),
  subjectDays: z
    .object({
      id: z.number().optional(),
      day: z.string().nonempty("Day can't be empty"),
    })
    .array(),
});

export const subjectFormValidator = withZod(subjectSchema);

export function SubjectForm({
  defaultValues,
}: {
  defaultValues?: Partial<z.infer<typeof subjectSchema>>;
}) {
  let navigate = useNavigate();
  const isSubmitting = useIsSubmitting();
  const [daysKeys, setDaysKeys] = useState(
    defaultValues?.subjectDays && defaultValues.subjectDays.length > 0
      ? Array.from(Array(defaultValues.subjectDays.length).keys())
      : [0]
  );

  return (
    <Box as="main" py="8" flex="1">
      <Container maxW="7xl" id="xxx">
        <Box bg="white" p="6" rounded="lg" shadow="base">
          <Box px="10" maxWidth="7xl">
            <ValidatedForm
              validator={subjectFormValidator}
              defaultValues={defaultValues}
              method="post"
            >
              <Stack spacing="6" direction="column">
                <Stack direction="row" spacing="6" align="center" width="full">
                  <FormInput name="name" label="Name" isRequired />
                  <FormInput
                    name="description"
                    label="Description"
                    isRequired
                  />
                </Stack>
                <Stack direction="row" spacing="6" align="center" width="full">
                  <FormInput
                    name="teacher.name"
                    label="Teacher Name"
                    isRequired
                  />
                  <FormInput
                    name="teacher.email"
                    label="Teacher Email"
                    isRequired
                  />
                </Stack>
                <VStack width="full" spacing="6" alignItems="flex-start">
                  {daysKeys.map((key, index) => (
                    <Stack direction="row" width="full" key={key}>
                      <FormSelect
                        name={`programDays[${index}].day`}
                        label="Subject Day"
                        isRequired
                        placeholder="Select Day"
                      >
                        <option value="Monday">Monday</option>
                        <option value="Tuesday">Tuesday</option>
                        <option value="Wednesday">Wednesday</option>
                        <option value="Thursday">Thursday</option>
                        <option value="Friday">Friday</option>
                        <option value="Saturday">Saturday</option>
                        <option value="Sunday">Sunday</option>
                      </FormSelect>
                      <Button
                        alignSelf="flex-end"
                        colorScheme="blue"
                        onClick={() =>
                          setDaysKeys(
                            daysKeys.filter((key, index2) => index2 !== index)
                          )
                        }
                      >
                        Delete
                      </Button>
                    </Stack>
                  ))}
                  <Button
                    colorScheme="blue"
                    size="xs"
                    onClick={() =>
                      setDaysKeys([
                        ...daysKeys,
                        1000 + daysKeys[daysKeys.length - 1],
                      ])
                    }
                  >
                    Add Day
                  </Button>
                </VStack>

                <HStack width="full" justifyContent="center" mt="8">
                  <Button
                    type="submit"
                    colorScheme="blue"
                    disabled={isSubmitting}
                    isLoading={isSubmitting}
                  >
                    {isSubmitting ? "Sending..." : "Send"}
                  </Button>
                  <Button variant="outline" onClick={() => navigate(-1)}>
                    Cancel
                  </Button>
                </HStack>
              </Stack>
            </ValidatedForm>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
