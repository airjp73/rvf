import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Spacer,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import { Subject, SubjectDays, Teacher } from "@prisma/client";
import { json, Link, LoaderFunction, useLoaderData } from "remix";
import { db } from "~/services/db.server";

export const loader: LoaderFunction = async () => {
  const subjects = await db.subject.findMany({
    include: { teacher: true, SubjectDays: true },
  });
  return json(subjects);
};

export default function Subjects() {
  const subjects =
    useLoaderData<
      (Subject & { teacher: Teacher; subjectDays: SubjectDays[] })[]
    >();
  return (
    <>
      <Box bg="white" pt="4" pb="4" shadow="sm">
        <Container maxW="7xl">
          <Flex>
            <Heading size="lg" mb="0">
              Subjects
            </Heading>
            <Spacer />
            <Link to="new">
              <Button colorScheme="blue">New</Button>
            </Link>
          </Flex>
        </Container>
      </Box>

      <Box as="main" py="8" flex="1">
        <Container maxW="7xl">
          <Box bg="white" p="6" rounded="lg" shadow="base" overflowX="auto">
            <Table borderWidth="1px" fontSize="sm">
              <Thead bg="white">
                <Tr>
                  <Th whiteSpace="nowrap" scope="col">
                    Subject
                  </Th>
                  <Th whiteSpace="nowrap" scope="col">
                    Teacher
                  </Th>
                  <Th whiteSpace="nowrap" scope="col"></Th>
                </Tr>
              </Thead>
              <Tbody>
                {subjects.map((subject) => (
                  <Tr key={subject.id}>
                    <Td whiteSpace="nowrap">{subject.name}</Td>
                    <Td>
                      {subject.teacher.name} ({subject.teacher.email})
                    </Td>
                    <Td textAlign="right">
                      <Link to={`${subject.id}/edit`}>
                        <Button variant="link" colorScheme="blue">
                          Edit
                        </Button>
                      </Link>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        </Container>
      </Box>
    </>
  );
}
