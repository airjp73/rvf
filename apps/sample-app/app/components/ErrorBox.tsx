import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
} from "@chakra-ui/react";

type ErrorProps = {
  title?: React.ReactNode;
  description?: React.ReactNode;
};
export function ErrorBox({ title, description }: ErrorProps) {
  return (
    <Alert
      status="error"
      variant="subtle"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      textAlign="center"
      height="200px"
    >
      <AlertIcon boxSize="40px" mr={0} />
      {title && (
        <AlertTitle mt={4} mb={1} fontSize="lg">
          {title}
        </AlertTitle>
      )}
      {description && (
        <AlertDescription maxWidth="sm">{description}</AlertDescription>
      )}
    </Alert>
  );
}
