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
import {
  json,
  Link,
  LoaderFunction,
  useCatch,
  useLoaderData,
  useParams,
} from "remix";
import { db } from "~/services/db.server";

export const loader: LoaderFunction = async () => {
  const subjects = await db.subject.findMany({
    include: { teacher: true, subjectDays: true },
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

export function CatchBoundary() {
  const caught = useCatch();
  const params = useParams();
  if (caught.status === 404) {
    return (
      <div className="error-container">
        Huh? What the heck is "{params.id}"?
      </div>
    );
  }
  throw new Error(`Unhandled error: ${caught.status}`);
}

export function ErrorBoundary() {
  const { jokeId } = useParams();
  return (
    <div className="error-container">{`There was an error loading joke by the id ${jokeId}. Sorry.`}</div>
  );
}
