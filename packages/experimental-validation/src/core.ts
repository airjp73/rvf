import { MaybePromise, PossiblyPromise } from "./maybePromise";
import { Merge } from "./typeHelpers";

export type AnyMeta = Record<string | number | symbol, any>;
export type AnyMethods = Record<string, any>;
export type AnySchema = Schema<any, any, {}, {}>;

export class Schema<
  Input,
  Output,
  Meta extends AnyMeta,
  Methods extends AnyMethods
> {
  static of<Input, Output, Meta extends AnyMeta, Methods extends AnyMethods>(
    perform: (input: Input, meta: AnyMeta) => PossiblyPromise<Output>,
    meta: Meta,
    methods: Methods,
    parent?: Schema<Input, Output, Meta, Methods>
  ): Schema<Input, Output, Meta, Methods> & Methods {
    // There really isn't a way to do this in a truly typesafe way as far as I can tell.
    // Object.keys isn't typesafe, so we have to hand wave a bit here.
    return new Schema(perform, meta, methods, parent) as any;
  }

  #perform: (input: Input, meta: AnyMeta) => PossiblyPromise<Output>;
  #methods: Methods;
  #meta: Meta;
  #parent: Schema<Input, Output, Meta, Methods> | undefined;

  get meta() {
    return this.#meta;
  }

  get parent() {
    return this.#parent;
  }

  private constructor(
    perform: (input: Input, meta: AnyMeta) => PossiblyPromise<Output>,
    meta: Meta,
    methods: Methods,
    parent?: Schema<Input, Output, Meta, Methods>
  ) {
    this.#meta = meta;
    this.#perform = perform;
    this.#methods = methods;
    this.#parent = parent;

    for (const [key, value] of Object.entries(methods)) {
      Object.defineProperty(this, key, {
        value,
        writable: false,
      });
    }
  }

  withMeta<NextMeta extends AnyMeta>(nextMeta: NextMeta) {
    return Schema.of<Input, Output, Merge<Meta, NextMeta>, Methods>(
      this.#perform,
      { ...this.#meta, ...nextMeta },
      this.#methods,
      this
    );
  }

  withMethods<NextMethods extends AnyMethods>(nextMethods: NextMethods) {
    return Schema.of<Input, Output, Meta, Merge<Methods, NextMethods>>(
      this.#perform,
      this.#meta,
      { ...this.#methods, ...nextMethods },
      this
    );
  }

  check(
    doCheck: (val: Output, meta: Meta) => PossiblyPromise<boolean>,
    makeError: (val: Output, meta: Meta) => string
  ) {
    return Schema.of<Input, Output, Meta, Methods>(
      (input, meta) =>
        this.validateMaybeAsync(input, meta).then((output) => {
          if (doCheck(output, meta)) return output;
          throw new Error(makeError(output, meta));
        }),
      this.#meta,
      this.#methods,
      this
    );
  }

  transform<NextOutput>(
    nextPerform: (input: Output, meta: Meta) => PossiblyPromise<NextOutput>
  ) {
    return Schema.of<Input, NextOutput, Meta, {}>(
      (input, meta) =>
        this.validateMaybeAsync(input, meta).then((output) =>
          nextPerform(output, meta)
        ),
      this.#meta,
      {},
      this
    );
  }

  as<NextOutput, NextMeta extends AnyMeta, NextMethods extends AnyMethods>(
    castTo: Schema<Output, NextOutput, NextMeta, NextMethods>
  ) {
    return Schema.of<Input, NextOutput, NextMeta, NextMethods>(
      (input, meta) =>
        this.validateMaybeAsync(input, meta).then((output) =>
          castTo.validateMaybeAsync(output, meta)
        ),
      { ...this.#meta, ...castTo.#meta },
      castTo.#methods,
      this
    );
  }

  validateMaybeAsync(input: Input, meta: AnyMeta): MaybePromise<Output> {
    return MaybePromise.of(() => this.#perform(input, meta));
  }

  validate(input: Input, meta: AnyMeta): Promise<Output> {
    return this.validateMaybeAsync(input, meta).await();
  }

  validateSync(input: Input, meta: AnyMeta): Output {
    return this.validateMaybeAsync(input, meta).assertSync();
  }
}
