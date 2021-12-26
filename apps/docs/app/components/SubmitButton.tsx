import { Button, Flex } from "@chakra-ui/react";
import { useIsSubmitting } from "remix-validated-form";

export const SubmitButton = () => {
  const isSubmitting = useIsSubmitting();
  return (
    <Flex justifyContent="flex-end">
      <Button
        type="submit"
        colorScheme="blue"
        disabled={isSubmitting}
        isLoading={isSubmitting}
      >
        {isSubmitting ? "Submitting..." : "Submit"}
      </Button>
    </Flex>
  );
};
