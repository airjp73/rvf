import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
} from "@chakra-ui/react";

export type InfoAlertProps = {
  title?: string;
  description?: string | JSX.Element;
};

export function InfoAlert({
  title,
  description,
}: InfoAlertProps) {
  return (
    <Alert
      status="info"
      variant="solid"
      alignItems="center"
    >
      <AlertIcon boxSize="40px" />
      <div>
        {title && <AlertTitle>{title}</AlertTitle>}
        {description && (
          <AlertDescription>{description}</AlertDescription>
        )}
      </div>
    </Alert>
  );
}
