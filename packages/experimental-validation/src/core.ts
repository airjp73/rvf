import { MaybePromise, PossiblyPromise } from "./maybePromise";
import { Merge } from "./typeHelpers";

export type AnyMeta = Record<string | number | symbol, any>;
export type AnyMethods = Record<string, any>;
export type AnySchema = Schema<any, any, any, any>;
export type SchemaOf<T> = Schema<any, T, any, any>;

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
  protected _perform: (input: Input, meta: AnyMeta) => PossiblyPromise<Output>;
  protected _methods: Methods;
  protected _meta: Meta;
  protected _parent: AnySchema | undefined;

  get meta() {
    return this._meta;
  }

  protected constructor(
    perform: (input: Input, meta: AnyMeta) => PossiblyPromise<Output>,
    meta: Meta,
    methods: Methods,
    parent?: Schema<Input, Output, Meta, Methods>
  ) {
    this._meta = meta;
    this._perform = perform;
    this._methods = methods;
    this._parent = parent;
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

  withMeta<NextMeta extends AnyMeta>(
    nextMeta: NextMeta
  ): SchemaType<
    SchemaInput<this>,
    SchemaOutput<this>,
    Merge<SchemaMeta<this>, NextMeta>,
    SchemaMethods<this>
  > {
    return Schema.of(
      this._perform as any,
      { ...this.meta, ...nextMeta } as any,
      this._methods as any,
      this
    );
  }

  withMethods<NextMethods extends AnyMethods>(
    nextMethods: NextMethods
  ): SchemaType<
    SchemaInput<this>,
    SchemaOutput<this>,
    SchemaMeta<this>,
    Merge<SchemaMethods<this>, NextMethods>
  > {
    return Schema.of(
      this._perform as any,
      this.meta as SchemaMeta<this>,
      { ...this._methods, ...nextMethods } as any,
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
      this._methods,
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
      this.meta as SchemaMeta<this>,
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
      castTo._methods,
      this
    );
  }

  validateMaybeAsync(input: Input, meta: AnyMeta): MaybePromise<Output> {
    return MaybePromise.of(() => this._perform(input, meta));
  }

  validate(input: Input): Promise<Output> {
    return this.validateMaybeAsync(input, this.meta).await();
  }

  validateSync(input: Input): Output {
    return this.validateMaybeAsync(input, this.meta).assertSync();
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
