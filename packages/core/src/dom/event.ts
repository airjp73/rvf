import { getFormControlValue } from "./dom";

export const getEventValue = (eventOrValue: unknown) => {
  if (
    typeof eventOrValue === "object" &&
    eventOrValue !== null &&
    "target" in eventOrValue &&
    eventOrValue.target instanceof HTMLElement
  ) {
    return getFormControlValue(eventOrValue.target);
  }

  return eventOrValue;
};
