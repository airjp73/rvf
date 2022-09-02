/**
 * Ponyfill of the HTMLFormElement.requestSubmit() method.
 * Based on polyfill from: https://github.com/javan/form-request-submit-polyfill/blob/main/form-request-submit-polyfill.js
 */
export const requestSubmit = (
  element: HTMLFormElement,
  submitter?: HTMLElement
) => {
  // In vitest, let's test the polyfill.
  // Cypress will test the native implementation by nature of using chrome.
  if (
    typeof Object.getPrototypeOf(element).requestSubmit === "function" &&
    !import.meta.vitest
  ) {
    element.requestSubmit(submitter);
    return;
  }

  if (submitter) {
    validateSubmitter(element, submitter);
    submitter.click();
    return;
  }

  const dummySubmitter = document.createElement("input");
  dummySubmitter.type = "submit";
  dummySubmitter.hidden = true;
  element.appendChild(dummySubmitter);
  dummySubmitter.click();
  element.removeChild(dummySubmitter);
};

function validateSubmitter(element: HTMLFormElement, submitter: HTMLElement) {
  // Should be redundant, but here for completeness
  const isHtmlElement = submitter instanceof HTMLElement;
  if (!isHtmlElement) {
    raise(TypeError, "parameter 1 is not of type 'HTMLElement'");
  }

  const hasSubmitType =
    "type" in submitter && (submitter as HTMLInputElement).type === "submit";
  if (!hasSubmitType)
    raise(TypeError, "The specified element is not a submit button");

  const isForCorrectForm =
    "form" in submitter && (submitter as HTMLInputElement).form === element;
  if (!isForCorrectForm)
    raise(
      DOMException,
      "The specified element is not owned by this form element",
      "NotFoundError"
    );
}

interface ErrorConstructor {
  new (message: string, name?: string): Error;
}

function raise(
  errorConstructor: ErrorConstructor,
  message: string,
  name?: string
): never {
  throw new errorConstructor(
    "Failed to execute 'requestSubmit' on 'HTMLFormElement': " + message + ".",
    name
  );
}

if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest;
  it("should validate the submitter", () => {
    const form = document.createElement("form");
    document.body.appendChild(form);

    const submitter = document.createElement("input");
    expect(() => validateSubmitter(null as any, null as any)).toThrow();
    expect(() => validateSubmitter(form, null as any)).toThrow();
    expect(() => validateSubmitter(form, submitter)).toThrow();
    expect(() =>
      validateSubmitter(form, document.createElement("div"))
    ).toThrow();

    submitter.type = "submit";
    expect(() => validateSubmitter(form, submitter)).toThrow();

    form.appendChild(submitter);
    expect(() => validateSubmitter(form, submitter)).not.toThrow();

    form.removeChild(submitter);
    expect(() => validateSubmitter(form, submitter)).toThrow();

    document.body.appendChild(submitter);
    form.id = "test-form";
    submitter.setAttribute("form", "test-form");
    expect(() => validateSubmitter(form, submitter)).not.toThrow();

    const button = document.createElement("button");
    button.type = "submit";
    form.appendChild(button);
    expect(() => validateSubmitter(form, button)).not.toThrow();
  });
}
