import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
} from "@chakra-ui/react";
import { useActionData } from "remix";

export function FormResponse() {
  const data = useActionData();
  if (!data) return null;

  const { title, description } = data;

  return (
    <Alert status="info" variant="solid" alignItems="center">
      <AlertIcon boxSize="40px" />
      <div>
        {title && <AlertTitle>{title}</AlertTitle>}
        {description && <AlertDescription>{description}</AlertDescription>}
      </div>
    </Alert>
  );
}
