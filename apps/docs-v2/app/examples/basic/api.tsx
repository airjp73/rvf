export type Project = {
  name: string;
  tasks: Array<{
    title: string;
    daysToComplete: number;
  }>;
};

export const createProject = async (data: Project) => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
};
