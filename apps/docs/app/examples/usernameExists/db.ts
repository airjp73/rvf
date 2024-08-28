export const db = {
  isUsernameAvailable: async (username: string) => {
    await new Promise((resolve) =>
      setTimeout(resolve, 1000),
    );

    if (
      username.endsWith("123") ||
      username.endsWith("234")
    ) {
      return true;
    }

    return false;
  },
};
