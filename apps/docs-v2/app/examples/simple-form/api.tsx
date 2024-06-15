export type SignupInfo = {
  username: FormDataEntryValue | null;
  password: FormDataEntryValue | null;
};

export const signUp = async (data: SignupInfo) => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  localStorage.setItem("simple-form-example", JSON.stringify(data));
};
