import { MaybePromise, PossiblyPromise } from "./maybePromise";
import { Merge } from "./typeHelpers";

export type AnyMeta = Record<string | number | symbol, any>;
export type AnyMethods = Record<string, any>;
export type AnySchema = Schema<any, any, any, any>;

type SchemaType<Input, Output, Meta, Methods> = Schema<
  Input,
  Output,
  Meta,
  Methods
> &
  Methods;

type SchemaInput<T> = T extends BaseSchema<infer U, any, {}, {}> ? U : never;
type SchemaOutput<T> = T extends BaseSchema<any, infer U, {}, {}> ? U : never;
type SchemaMeta<T> = T extends BaseSchema<any, any, infer U, {}> ? U : never;
type SchemaMethods<T> = T extends BaseSchema<any, any, {}, infer U> ? U : never;

export class BaseSchema<
  Input,
  Output,
  Meta extends AnyMeta,
  Methods extends AnyMethods
> {
  protected perform: (input: Input, meta: AnyMeta) => PossiblyPromise<Output>;
  protected methods: Methods;
  protected meta: Meta;
  protected parent: AnySchema | undefined;

  protected constructor(
    perform: (input: Input, meta: AnyMeta) => PossiblyPromise<Output>,
    meta: Meta,
    methods: Methods,
    parent?: Schema<Input, Output, Meta, Methods>
  ) {
    this.meta = meta;
    this.perform = perform;
    this.methods = methods;
    this.parent = parent;
  }
}

export class Schema<
  Input,
  Output,
  Meta extends AnyMeta,
  Methods extends AnyMethods
> extends BaseSchema<Input, Output, Meta, Methods> {
  static of<Input, Output, Meta extends AnyMeta, Methods extends AnyMethods>(
    perform: (input: Input, meta: AnyMeta) => PossiblyPromise<Output>,
    meta: Meta,
    methods: Methods,
    parent?: AnySchema
  ): Schema<Input, Output, Meta, Methods> & Methods {
    // There really isn't a way to do this in a truly typesafe way as far as I can tell.
    // Object.keys isn't typesafe, so we have to hand wave a bit here.
    return new Schema(perform, meta, methods, parent) as any;
  }

  private constructor(
    perform: (input: Input, meta: AnyMeta) => PossiblyPromise<Output>,
    meta: Meta,
    methods: Methods,
    parent?: Schema<Input, Output, Meta, Methods>
  ) {
    super(perform, meta, methods, parent);

    for (const [key, value] of Object.entries(methods)) {
      Object.defineProperty(this, key, {
        value,
        writable: false,
      });
    }
  }

  withMeta<NextMeta extends AnyMeta>(nextMeta: NextMeta) {
    return Schema.of<Input, Output, Merge<Meta, NextMeta>, Methods>(
      this.perform,
      { ...this.meta, ...nextMeta },
      this.methods,
      this
    );
  }

  withMethods<NextMethods extends AnyMethods>(nextMethods: NextMethods) {
    return Schema.of<Input, Output, Meta, Merge<Methods, NextMethods>>(
      this.perform,
      this.meta,
      { ...this.methods, ...nextMethods },
      this
    );
  }

  check(
    doCheck: (val: Output, meta: Meta) => PossiblyPromise<boolean>,
    makeError: (val: Output, meta: Meta) => string
  ): this {
    return Schema.of<Input, Output, Meta, Methods>(
      (input, meta) =>
        this.validateMaybeAsync(input, meta).then((output) => {
          if (doCheck(output, meta)) return output;
          throw new Error(makeError(output, meta));
        }),
      this.meta,
      this.methods,
      this
    ) as this;
  }

  transform<NextOutput>(
    nextPerform: (input: Output, meta: Meta) => PossiblyPromise<NextOutput>
  ): SchemaType<
    SchemaInput<this>,
    NextOutput,
    SchemaMeta<this>,
    Record<string, never>
  > {
    return Schema.of<
      SchemaInput<this>,
      NextOutput,
      SchemaMeta<this>,
      Record<string, never>
    >(
      (input, meta) =>
        this.validateMaybeAsync(input, meta).then((output) =>
          nextPerform(output, meta)
        ),
      this.meta as any,
      {},
      this
    );
  }

  as<NextOutput, NextMeta extends AnyMeta, NextMethods extends AnyMethods>(
    castTo: Schema<Output, NextOutput, NextMeta, NextMethods>
  ): SchemaType<SchemaInput<this>, NextOutput, NextMeta, NextMethods> {
    return Schema.of<SchemaInput<this>, NextOutput, NextMeta, NextMethods>(
      (input, meta) =>
        this.validateMaybeAsync(input, meta).then((output) =>
          castTo.validateMaybeAsync(output, meta)
        ),
      { ...this.meta, ...castTo.meta },
      castTo.methods,
      this
    );
  }

  validateMaybeAsync(input: Input, meta: AnyMeta): MaybePromise<Output> {
    return MaybePromise.of(() => this.perform(input, meta));
  }

  validate(input: Input, meta: AnyMeta): Promise<Output> {
    return this.validateMaybeAsync(input, meta).await();
  }

  validateSync(input: Input, meta: AnyMeta): Output {
    return this.validateMaybeAsync(input, meta).assertSync();
  }
}

export const makeType = <Output, Methods extends AnyMethods>(
  doCheck: (val: unknown, meta: AnyMeta) => val is Output,
  makeError: (val: unknown, meta: AnyMeta) => string,
  methods: Methods
) =>
  Schema.of(
    (input: unknown, meta: AnyMeta) => {
      if (doCheck(input, meta)) return input;
      throw new Error(makeError(input, meta));
    },
    {},
    methods
  );
