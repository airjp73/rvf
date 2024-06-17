export const isEvent = (eventOrValue: unknown) =>
  typeof eventOrValue === "object" &&
  eventOrValue !== null &&
  "target" in eventOrValue &&
  eventOrValue.target instanceof HTMLElement;
