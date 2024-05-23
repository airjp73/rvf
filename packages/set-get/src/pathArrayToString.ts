export const pathArrayToString = (path: (string | number)[]): string => {
  if (path.length === 0) return "";

  let result = "";
  for (const item of path) {
    if (result === "") {
      result += `${item}`;
      continue;
    }

    const asNumber = Number(item);
    if (Number.isNaN(asNumber)) result += `.${item}`;
    else result += `[${item}]`;
  }

  return result;
};
