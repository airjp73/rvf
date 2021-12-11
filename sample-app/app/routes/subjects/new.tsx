import { Box, Container, Heading } from "@chakra-ui/react";
import { SubjectForm } from "~/components/SubjectForm";

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
