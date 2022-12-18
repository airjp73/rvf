import { Box, Container, Heading } from "@chakra-ui/react";
import { DataFunctionArgs, redirect } from "@remix-run/node";
import { validationError } from "remix-validated-form";
import { SubjectForm, subjectFormValidator } from "~/components/SubjectForm";
import { db } from "~/services/db.server";

export const action = async ({ request }: DataFunctionArgs) => {
  const fieldValues = await subjectFormValidator.validate(
    await request.formData()
  );
  if (fieldValues.error) return validationError(fieldValues.error);

  const { teacher, subjectDays, ...newSubject } = fieldValues.data;

  await db.subject.create({
    data: {
      ...newSubject,
      teacher: {
        create: teacher,
      },
      subjectDays: {
        create: subjectDays,
      },
    },
  });

  return redirect("/subjects");
};

export default function NewSubject() {
  return (
    <>
      <Box bg="white" pt="4" pb="4" shadow="sm">
        <Container maxW="7xl">
          <Heading size="lg" mb="0">
            Create Subject
          </Heading>
        </Container>
      </Box>

      <Box as="main" py="8" flex="1">
        <Container maxW="7xl">
          <SubjectForm />
        </Container>
      </Box>
    </>
  );
}
