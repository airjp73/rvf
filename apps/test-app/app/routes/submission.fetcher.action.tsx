export const action = async () => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return { done: "done" };
};
