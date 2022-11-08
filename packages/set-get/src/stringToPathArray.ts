export const stringToPathArray = <T extends string>(
  path: T
): (string | number)[] => {
  if (path.length === 0) return [];

  const match =
    path.match(/^\[(.+?)\](.*)$/) || path.match(/^\.?([^\.\[\]]+)(.*)$/);
  if (match) {
    const [_, key, rest] = match;
    return [/^\d+$/.test(key) ? Number(key) : key, ...stringToPathArray(rest)];
  }
  return [path];
};
