import "@testing-library/jest-dom/vitest";

if (typeof Promise.withResolvers === "undefined") {
  // @ts-expect-error
  Promise.withResolvers = function () {
    let resolve, reject;
    const promise = new Promise((res, rej) => {
      resolve = res;
      reject = rej;
    });
    return { promise, resolve, reject };
  };
}
