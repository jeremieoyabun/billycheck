
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model Scan
 * 
 */
export type Scan = $Result.DefaultSelection<Prisma.$ScanPayload>
/**
 * Model UserQuota
 * 
 */
export type UserQuota = $Result.DefaultSelection<Prisma.$UserQuotaPayload>
/**
 * Model StripePayment
 * 
 */
export type StripePayment = $Result.DefaultSelection<Prisma.$StripePaymentPayload>

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Scans
 * const scans = await prisma.scan.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  const U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Scans
   * const scans = await prisma.scan.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.scan`: Exposes CRUD operations for the **Scan** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Scans
    * const scans = await prisma.scan.findMany()
    * ```
    */
  get scan(): Prisma.ScanDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.userQuota`: Exposes CRUD operations for the **UserQuota** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more UserQuotas
    * const userQuotas = await prisma.userQuota.findMany()
    * ```
    */
  get userQuota(): Prisma.UserQuotaDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.stripePayment`: Exposes CRUD operations for the **StripePayment** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more StripePayments
    * const stripePayments = await prisma.stripePayment.findMany()
    * ```
    */
  get stripePayment(): Prisma.StripePaymentDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 6.19.2
   * Query Engine version: c2990dca591cba766e3b7ef5d9e8a84796e47ab7
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import Bytes = runtime.Bytes
  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    Scan: 'Scan',
    UserQuota: 'UserQuota',
    StripePayment: 'StripePayment'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "scan" | "userQuota" | "stripePayment"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      Scan: {
        payload: Prisma.$ScanPayload<ExtArgs>
        fields: Prisma.ScanFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ScanFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ScanPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ScanFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ScanPayload>
          }
          findFirst: {
            args: Prisma.ScanFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ScanPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ScanFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ScanPayload>
          }
          findMany: {
            args: Prisma.ScanFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ScanPayload>[]
          }
          create: {
            args: Prisma.ScanCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ScanPayload>
          }
          createMany: {
            args: Prisma.ScanCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ScanCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ScanPayload>[]
          }
          delete: {
            args: Prisma.ScanDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ScanPayload>
          }
          update: {
            args: Prisma.ScanUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ScanPayload>
          }
          deleteMany: {
            args: Prisma.ScanDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ScanUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.ScanUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ScanPayload>[]
          }
          upsert: {
            args: Prisma.ScanUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ScanPayload>
          }
          aggregate: {
            args: Prisma.ScanAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateScan>
          }
          groupBy: {
            args: Prisma.ScanGroupByArgs<ExtArgs>
            result: $Utils.Optional<ScanGroupByOutputType>[]
          }
          count: {
            args: Prisma.ScanCountArgs<ExtArgs>
            result: $Utils.Optional<ScanCountAggregateOutputType> | number
          }
        }
      }
      UserQuota: {
        payload: Prisma.$UserQuotaPayload<ExtArgs>
        fields: Prisma.UserQuotaFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UserQuotaFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserQuotaPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UserQuotaFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserQuotaPayload>
          }
          findFirst: {
            args: Prisma.UserQuotaFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserQuotaPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UserQuotaFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserQuotaPayload>
          }
          findMany: {
            args: Prisma.UserQuotaFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserQuotaPayload>[]
          }
          create: {
            args: Prisma.UserQuotaCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserQuotaPayload>
          }
          createMany: {
            args: Prisma.UserQuotaCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.UserQuotaCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserQuotaPayload>[]
          }
          delete: {
            args: Prisma.UserQuotaDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserQuotaPayload>
          }
          update: {
            args: Prisma.UserQuotaUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserQuotaPayload>
          }
          deleteMany: {
            args: Prisma.UserQuotaDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UserQuotaUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.UserQuotaUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserQuotaPayload>[]
          }
          upsert: {
            args: Prisma.UserQuotaUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserQuotaPayload>
          }
          aggregate: {
            args: Prisma.UserQuotaAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUserQuota>
          }
          groupBy: {
            args: Prisma.UserQuotaGroupByArgs<ExtArgs>
            result: $Utils.Optional<UserQuotaGroupByOutputType>[]
          }
          count: {
            args: Prisma.UserQuotaCountArgs<ExtArgs>
            result: $Utils.Optional<UserQuotaCountAggregateOutputType> | number
          }
        }
      }
      StripePayment: {
        payload: Prisma.$StripePaymentPayload<ExtArgs>
        fields: Prisma.StripePaymentFieldRefs
        operations: {
          findUnique: {
            args: Prisma.StripePaymentFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StripePaymentPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.StripePaymentFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StripePaymentPayload>
          }
          findFirst: {
            args: Prisma.StripePaymentFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StripePaymentPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.StripePaymentFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StripePaymentPayload>
          }
          findMany: {
            args: Prisma.StripePaymentFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StripePaymentPayload>[]
          }
          create: {
            args: Prisma.StripePaymentCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StripePaymentPayload>
          }
          createMany: {
            args: Prisma.StripePaymentCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.StripePaymentCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StripePaymentPayload>[]
          }
          delete: {
            args: Prisma.StripePaymentDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StripePaymentPayload>
          }
          update: {
            args: Prisma.StripePaymentUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StripePaymentPayload>
          }
          deleteMany: {
            args: Prisma.StripePaymentDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.StripePaymentUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.StripePaymentUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StripePaymentPayload>[]
          }
          upsert: {
            args: Prisma.StripePaymentUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StripePaymentPayload>
          }
          aggregate: {
            args: Prisma.StripePaymentAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateStripePayment>
          }
          groupBy: {
            args: Prisma.StripePaymentGroupByArgs<ExtArgs>
            result: $Utils.Optional<StripePaymentGroupByOutputType>[]
          }
          count: {
            args: Prisma.StripePaymentCountArgs<ExtArgs>
            result: $Utils.Optional<StripePaymentCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Shorthand for `emit: 'stdout'`
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events only
     * log: [
     *   { emit: 'event', level: 'query' },
     *   { emit: 'event', level: 'info' },
     *   { emit: 'event', level: 'warn' }
     *   { emit: 'event', level: 'error' }
     * ]
     * 
     * / Emit as events and log to stdout
     * og: [
     *  { emit: 'stdout', level: 'query' },
     *  { emit: 'stdout', level: 'info' },
     *  { emit: 'stdout', level: 'warn' }
     *  { emit: 'stdout', level: 'error' }
     * 
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * Instance of a Driver Adapter, e.g., like one provided by `@prisma/adapter-planetscale`
     */
    adapter?: runtime.SqlDriverAdapterFactory | null
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
  }
  export type GlobalOmitConfig = {
    scan?: ScanOmit
    userQuota?: UserQuotaOmit
    stripePayment?: StripePaymentOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type CheckIsLogLevel<T> = T extends LogLevel ? T : never;

  export type GetLogType<T> = CheckIsLogLevel<
    T extends LogDefinition ? T['level'] : T
  >;

  export type GetEvents<T extends any[]> = T extends Array<LogLevel | LogDefinition>
    ? GetLogType<T[number]>
    : never;

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */



  /**
   * Models
   */

  /**
   * Model Scan
   */

  export type AggregateScan = {
    _count: ScanCountAggregateOutputType | null
    _avg: ScanAvgAggregateOutputType | null
    _sum: ScanSumAggregateOutputType | null
    _min: ScanMinAggregateOutputType | null
    _max: ScanMaxAggregateOutputType | null
  }

  export type ScanAvgAggregateOutputType = {
    size: number | null
  }

  export type ScanSumAggregateOutputType = {
    size: number | null
  }

  export type ScanMinAggregateOutputType = {
    id: string | null
    createdAt: Date | null
    status: string | null
    engagement: string | null
    fileKey: string | null
    originalName: string | null
    mimeType: string | null
    size: number | null
    userIdentifier: string | null
  }

  export type ScanMaxAggregateOutputType = {
    id: string | null
    createdAt: Date | null
    status: string | null
    engagement: string | null
    fileKey: string | null
    originalName: string | null
    mimeType: string | null
    size: number | null
    userIdentifier: string | null
  }

  export type ScanCountAggregateOutputType = {
    id: number
    createdAt: number
    status: number
    engagement: number
    fileKey: number
    originalName: number
    mimeType: number
    size: number
    resultJson: number
    userIdentifier: number
    _all: number
  }


  export type ScanAvgAggregateInputType = {
    size?: true
  }

  export type ScanSumAggregateInputType = {
    size?: true
  }

  export type ScanMinAggregateInputType = {
    id?: true
    createdAt?: true
    status?: true
    engagement?: true
    fileKey?: true
    originalName?: true
    mimeType?: true
    size?: true
    userIdentifier?: true
  }

  export type ScanMaxAggregateInputType = {
    id?: true
    createdAt?: true
    status?: true
    engagement?: true
    fileKey?: true
    originalName?: true
    mimeType?: true
    size?: true
    userIdentifier?: true
  }

  export type ScanCountAggregateInputType = {
    id?: true
    createdAt?: true
    status?: true
    engagement?: true
    fileKey?: true
    originalName?: true
    mimeType?: true
    size?: true
    resultJson?: true
    userIdentifier?: true
    _all?: true
  }

  export type ScanAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Scan to aggregate.
     */
    where?: ScanWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Scans to fetch.
     */
    orderBy?: ScanOrderByWithRelationInput | ScanOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ScanWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Scans from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Scans.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Scans
    **/
    _count?: true | ScanCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ScanAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ScanSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ScanMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ScanMaxAggregateInputType
  }

  export type GetScanAggregateType<T extends ScanAggregateArgs> = {
        [P in keyof T & keyof AggregateScan]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateScan[P]>
      : GetScalarType<T[P], AggregateScan[P]>
  }




  export type ScanGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ScanWhereInput
    orderBy?: ScanOrderByWithAggregationInput | ScanOrderByWithAggregationInput[]
    by: ScanScalarFieldEnum[] | ScanScalarFieldEnum
    having?: ScanScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ScanCountAggregateInputType | true
    _avg?: ScanAvgAggregateInputType
    _sum?: ScanSumAggregateInputType
    _min?: ScanMinAggregateInputType
    _max?: ScanMaxAggregateInputType
  }

  export type ScanGroupByOutputType = {
    id: string
    createdAt: Date
    status: string
    engagement: string | null
    fileKey: string | null
    originalName: string | null
    mimeType: string | null
    size: number | null
    resultJson: JsonValue | null
    userIdentifier: string | null
    _count: ScanCountAggregateOutputType | null
    _avg: ScanAvgAggregateOutputType | null
    _sum: ScanSumAggregateOutputType | null
    _min: ScanMinAggregateOutputType | null
    _max: ScanMaxAggregateOutputType | null
  }

  type GetScanGroupByPayload<T extends ScanGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ScanGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ScanGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ScanGroupByOutputType[P]>
            : GetScalarType<T[P], ScanGroupByOutputType[P]>
        }
      >
    >


  export type ScanSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    createdAt?: boolean
    status?: boolean
    engagement?: boolean
    fileKey?: boolean
    originalName?: boolean
    mimeType?: boolean
    size?: boolean
    resultJson?: boolean
    userIdentifier?: boolean
  }, ExtArgs["result"]["scan"]>

  export type ScanSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    createdAt?: boolean
    status?: boolean
    engagement?: boolean
    fileKey?: boolean
    originalName?: boolean
    mimeType?: boolean
    size?: boolean
    resultJson?: boolean
    userIdentifier?: boolean
  }, ExtArgs["result"]["scan"]>

  export type ScanSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    createdAt?: boolean
    status?: boolean
    engagement?: boolean
    fileKey?: boolean
    originalName?: boolean
    mimeType?: boolean
    size?: boolean
    resultJson?: boolean
    userIdentifier?: boolean
  }, ExtArgs["result"]["scan"]>

  export type ScanSelectScalar = {
    id?: boolean
    createdAt?: boolean
    status?: boolean
    engagement?: boolean
    fileKey?: boolean
    originalName?: boolean
    mimeType?: boolean
    size?: boolean
    resultJson?: boolean
    userIdentifier?: boolean
  }

  export type ScanOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "createdAt" | "status" | "engagement" | "fileKey" | "originalName" | "mimeType" | "size" | "resultJson" | "userIdentifier", ExtArgs["result"]["scan"]>

  export type $ScanPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Scan"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      createdAt: Date
      status: string
      engagement: string | null
      fileKey: string | null
      originalName: string | null
      mimeType: string | null
      size: number | null
      resultJson: Prisma.JsonValue | null
      userIdentifier: string | null
    }, ExtArgs["result"]["scan"]>
    composites: {}
  }

  type ScanGetPayload<S extends boolean | null | undefined | ScanDefaultArgs> = $Result.GetResult<Prisma.$ScanPayload, S>

  type ScanCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ScanFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ScanCountAggregateInputType | true
    }

  export interface ScanDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Scan'], meta: { name: 'Scan' } }
    /**
     * Find zero or one Scan that matches the filter.
     * @param {ScanFindUniqueArgs} args - Arguments to find a Scan
     * @example
     * // Get one Scan
     * const scan = await prisma.scan.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ScanFindUniqueArgs>(args: SelectSubset<T, ScanFindUniqueArgs<ExtArgs>>): Prisma__ScanClient<$Result.GetResult<Prisma.$ScanPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Scan that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ScanFindUniqueOrThrowArgs} args - Arguments to find a Scan
     * @example
     * // Get one Scan
     * const scan = await prisma.scan.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ScanFindUniqueOrThrowArgs>(args: SelectSubset<T, ScanFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ScanClient<$Result.GetResult<Prisma.$ScanPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Scan that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ScanFindFirstArgs} args - Arguments to find a Scan
     * @example
     * // Get one Scan
     * const scan = await prisma.scan.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ScanFindFirstArgs>(args?: SelectSubset<T, ScanFindFirstArgs<ExtArgs>>): Prisma__ScanClient<$Result.GetResult<Prisma.$ScanPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Scan that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ScanFindFirstOrThrowArgs} args - Arguments to find a Scan
     * @example
     * // Get one Scan
     * const scan = await prisma.scan.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ScanFindFirstOrThrowArgs>(args?: SelectSubset<T, ScanFindFirstOrThrowArgs<ExtArgs>>): Prisma__ScanClient<$Result.GetResult<Prisma.$ScanPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Scans that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ScanFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Scans
     * const scans = await prisma.scan.findMany()
     * 
     * // Get first 10 Scans
     * const scans = await prisma.scan.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const scanWithIdOnly = await prisma.scan.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ScanFindManyArgs>(args?: SelectSubset<T, ScanFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ScanPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Scan.
     * @param {ScanCreateArgs} args - Arguments to create a Scan.
     * @example
     * // Create one Scan
     * const Scan = await prisma.scan.create({
     *   data: {
     *     // ... data to create a Scan
     *   }
     * })
     * 
     */
    create<T extends ScanCreateArgs>(args: SelectSubset<T, ScanCreateArgs<ExtArgs>>): Prisma__ScanClient<$Result.GetResult<Prisma.$ScanPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Scans.
     * @param {ScanCreateManyArgs} args - Arguments to create many Scans.
     * @example
     * // Create many Scans
     * const scan = await prisma.scan.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ScanCreateManyArgs>(args?: SelectSubset<T, ScanCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Scans and returns the data saved in the database.
     * @param {ScanCreateManyAndReturnArgs} args - Arguments to create many Scans.
     * @example
     * // Create many Scans
     * const scan = await prisma.scan.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Scans and only return the `id`
     * const scanWithIdOnly = await prisma.scan.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ScanCreateManyAndReturnArgs>(args?: SelectSubset<T, ScanCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ScanPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Scan.
     * @param {ScanDeleteArgs} args - Arguments to delete one Scan.
     * @example
     * // Delete one Scan
     * const Scan = await prisma.scan.delete({
     *   where: {
     *     // ... filter to delete one Scan
     *   }
     * })
     * 
     */
    delete<T extends ScanDeleteArgs>(args: SelectSubset<T, ScanDeleteArgs<ExtArgs>>): Prisma__ScanClient<$Result.GetResult<Prisma.$ScanPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Scan.
     * @param {ScanUpdateArgs} args - Arguments to update one Scan.
     * @example
     * // Update one Scan
     * const scan = await prisma.scan.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ScanUpdateArgs>(args: SelectSubset<T, ScanUpdateArgs<ExtArgs>>): Prisma__ScanClient<$Result.GetResult<Prisma.$ScanPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Scans.
     * @param {ScanDeleteManyArgs} args - Arguments to filter Scans to delete.
     * @example
     * // Delete a few Scans
     * const { count } = await prisma.scan.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ScanDeleteManyArgs>(args?: SelectSubset<T, ScanDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Scans.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ScanUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Scans
     * const scan = await prisma.scan.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ScanUpdateManyArgs>(args: SelectSubset<T, ScanUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Scans and returns the data updated in the database.
     * @param {ScanUpdateManyAndReturnArgs} args - Arguments to update many Scans.
     * @example
     * // Update many Scans
     * const scan = await prisma.scan.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Scans and only return the `id`
     * const scanWithIdOnly = await prisma.scan.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends ScanUpdateManyAndReturnArgs>(args: SelectSubset<T, ScanUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ScanPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Scan.
     * @param {ScanUpsertArgs} args - Arguments to update or create a Scan.
     * @example
     * // Update or create a Scan
     * const scan = await prisma.scan.upsert({
     *   create: {
     *     // ... data to create a Scan
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Scan we want to update
     *   }
     * })
     */
    upsert<T extends ScanUpsertArgs>(args: SelectSubset<T, ScanUpsertArgs<ExtArgs>>): Prisma__ScanClient<$Result.GetResult<Prisma.$ScanPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Scans.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ScanCountArgs} args - Arguments to filter Scans to count.
     * @example
     * // Count the number of Scans
     * const count = await prisma.scan.count({
     *   where: {
     *     // ... the filter for the Scans we want to count
     *   }
     * })
    **/
    count<T extends ScanCountArgs>(
      args?: Subset<T, ScanCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ScanCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Scan.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ScanAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ScanAggregateArgs>(args: Subset<T, ScanAggregateArgs>): Prisma.PrismaPromise<GetScanAggregateType<T>>

    /**
     * Group by Scan.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ScanGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ScanGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ScanGroupByArgs['orderBy'] }
        : { orderBy?: ScanGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ScanGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetScanGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Scan model
   */
  readonly fields: ScanFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Scan.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ScanClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Scan model
   */
  interface ScanFieldRefs {
    readonly id: FieldRef<"Scan", 'String'>
    readonly createdAt: FieldRef<"Scan", 'DateTime'>
    readonly status: FieldRef<"Scan", 'String'>
    readonly engagement: FieldRef<"Scan", 'String'>
    readonly fileKey: FieldRef<"Scan", 'String'>
    readonly originalName: FieldRef<"Scan", 'String'>
    readonly mimeType: FieldRef<"Scan", 'String'>
    readonly size: FieldRef<"Scan", 'Int'>
    readonly resultJson: FieldRef<"Scan", 'Json'>
    readonly userIdentifier: FieldRef<"Scan", 'String'>
  }
    

  // Custom InputTypes
  /**
   * Scan findUnique
   */
  export type ScanFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Scan
     */
    select?: ScanSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Scan
     */
    omit?: ScanOmit<ExtArgs> | null
    /**
     * Filter, which Scan to fetch.
     */
    where: ScanWhereUniqueInput
  }

  /**
   * Scan findUniqueOrThrow
   */
  export type ScanFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Scan
     */
    select?: ScanSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Scan
     */
    omit?: ScanOmit<ExtArgs> | null
    /**
     * Filter, which Scan to fetch.
     */
    where: ScanWhereUniqueInput
  }

  /**
   * Scan findFirst
   */
  export type ScanFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Scan
     */
    select?: ScanSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Scan
     */
    omit?: ScanOmit<ExtArgs> | null
    /**
     * Filter, which Scan to fetch.
     */
    where?: ScanWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Scans to fetch.
     */
    orderBy?: ScanOrderByWithRelationInput | ScanOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Scans.
     */
    cursor?: ScanWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Scans from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Scans.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Scans.
     */
    distinct?: ScanScalarFieldEnum | ScanScalarFieldEnum[]
  }

  /**
   * Scan findFirstOrThrow
   */
  export type ScanFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Scan
     */
    select?: ScanSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Scan
     */
    omit?: ScanOmit<ExtArgs> | null
    /**
     * Filter, which Scan to fetch.
     */
    where?: ScanWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Scans to fetch.
     */
    orderBy?: ScanOrderByWithRelationInput | ScanOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Scans.
     */
    cursor?: ScanWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Scans from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Scans.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Scans.
     */
    distinct?: ScanScalarFieldEnum | ScanScalarFieldEnum[]
  }

  /**
   * Scan findMany
   */
  export type ScanFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Scan
     */
    select?: ScanSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Scan
     */
    omit?: ScanOmit<ExtArgs> | null
    /**
     * Filter, which Scans to fetch.
     */
    where?: ScanWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Scans to fetch.
     */
    orderBy?: ScanOrderByWithRelationInput | ScanOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Scans.
     */
    cursor?: ScanWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Scans from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Scans.
     */
    skip?: number
    distinct?: ScanScalarFieldEnum | ScanScalarFieldEnum[]
  }

  /**
   * Scan create
   */
  export type ScanCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Scan
     */
    select?: ScanSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Scan
     */
    omit?: ScanOmit<ExtArgs> | null
    /**
     * The data needed to create a Scan.
     */
    data: XOR<ScanCreateInput, ScanUncheckedCreateInput>
  }

  /**
   * Scan createMany
   */
  export type ScanCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Scans.
     */
    data: ScanCreateManyInput | ScanCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Scan createManyAndReturn
   */
  export type ScanCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Scan
     */
    select?: ScanSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Scan
     */
    omit?: ScanOmit<ExtArgs> | null
    /**
     * The data used to create many Scans.
     */
    data: ScanCreateManyInput | ScanCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Scan update
   */
  export type ScanUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Scan
     */
    select?: ScanSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Scan
     */
    omit?: ScanOmit<ExtArgs> | null
    /**
     * The data needed to update a Scan.
     */
    data: XOR<ScanUpdateInput, ScanUncheckedUpdateInput>
    /**
     * Choose, which Scan to update.
     */
    where: ScanWhereUniqueInput
  }

  /**
   * Scan updateMany
   */
  export type ScanUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Scans.
     */
    data: XOR<ScanUpdateManyMutationInput, ScanUncheckedUpdateManyInput>
    /**
     * Filter which Scans to update
     */
    where?: ScanWhereInput
    /**
     * Limit how many Scans to update.
     */
    limit?: number
  }

  /**
   * Scan updateManyAndReturn
   */
  export type ScanUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Scan
     */
    select?: ScanSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Scan
     */
    omit?: ScanOmit<ExtArgs> | null
    /**
     * The data used to update Scans.
     */
    data: XOR<ScanUpdateManyMutationInput, ScanUncheckedUpdateManyInput>
    /**
     * Filter which Scans to update
     */
    where?: ScanWhereInput
    /**
     * Limit how many Scans to update.
     */
    limit?: number
  }

  /**
   * Scan upsert
   */
  export type ScanUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Scan
     */
    select?: ScanSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Scan
     */
    omit?: ScanOmit<ExtArgs> | null
    /**
     * The filter to search for the Scan to update in case it exists.
     */
    where: ScanWhereUniqueInput
    /**
     * In case the Scan found by the `where` argument doesn't exist, create a new Scan with this data.
     */
    create: XOR<ScanCreateInput, ScanUncheckedCreateInput>
    /**
     * In case the Scan was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ScanUpdateInput, ScanUncheckedUpdateInput>
  }

  /**
   * Scan delete
   */
  export type ScanDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Scan
     */
    select?: ScanSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Scan
     */
    omit?: ScanOmit<ExtArgs> | null
    /**
     * Filter which Scan to delete.
     */
    where: ScanWhereUniqueInput
  }

  /**
   * Scan deleteMany
   */
  export type ScanDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Scans to delete
     */
    where?: ScanWhereInput
    /**
     * Limit how many Scans to delete.
     */
    limit?: number
  }

  /**
   * Scan without action
   */
  export type ScanDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Scan
     */
    select?: ScanSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Scan
     */
    omit?: ScanOmit<ExtArgs> | null
  }


  /**
   * Model UserQuota
   */

  export type AggregateUserQuota = {
    _count: UserQuotaCountAggregateOutputType | null
    _avg: UserQuotaAvgAggregateOutputType | null
    _sum: UserQuotaSumAggregateOutputType | null
    _min: UserQuotaMinAggregateOutputType | null
    _max: UserQuotaMaxAggregateOutputType | null
  }

  export type UserQuotaAvgAggregateOutputType = {
    freeScansUsed: number | null
    paidCredits: number | null
  }

  export type UserQuotaSumAggregateOutputType = {
    freeScansUsed: number | null
    paidCredits: number | null
  }

  export type UserQuotaMinAggregateOutputType = {
    id: string | null
    userIdentifier: string | null
    freeScansUsed: number | null
    paidCredits: number | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type UserQuotaMaxAggregateOutputType = {
    id: string | null
    userIdentifier: string | null
    freeScansUsed: number | null
    paidCredits: number | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type UserQuotaCountAggregateOutputType = {
    id: number
    userIdentifier: number
    freeScansUsed: number
    paidCredits: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type UserQuotaAvgAggregateInputType = {
    freeScansUsed?: true
    paidCredits?: true
  }

  export type UserQuotaSumAggregateInputType = {
    freeScansUsed?: true
    paidCredits?: true
  }

  export type UserQuotaMinAggregateInputType = {
    id?: true
    userIdentifier?: true
    freeScansUsed?: true
    paidCredits?: true
    createdAt?: true
    updatedAt?: true
  }

  export type UserQuotaMaxAggregateInputType = {
    id?: true
    userIdentifier?: true
    freeScansUsed?: true
    paidCredits?: true
    createdAt?: true
    updatedAt?: true
  }

  export type UserQuotaCountAggregateInputType = {
    id?: true
    userIdentifier?: true
    freeScansUsed?: true
    paidCredits?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type UserQuotaAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which UserQuota to aggregate.
     */
    where?: UserQuotaWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserQuotas to fetch.
     */
    orderBy?: UserQuotaOrderByWithRelationInput | UserQuotaOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UserQuotaWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserQuotas from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserQuotas.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned UserQuotas
    **/
    _count?: true | UserQuotaCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: UserQuotaAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: UserQuotaSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UserQuotaMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UserQuotaMaxAggregateInputType
  }

  export type GetUserQuotaAggregateType<T extends UserQuotaAggregateArgs> = {
        [P in keyof T & keyof AggregateUserQuota]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUserQuota[P]>
      : GetScalarType<T[P], AggregateUserQuota[P]>
  }




  export type UserQuotaGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserQuotaWhereInput
    orderBy?: UserQuotaOrderByWithAggregationInput | UserQuotaOrderByWithAggregationInput[]
    by: UserQuotaScalarFieldEnum[] | UserQuotaScalarFieldEnum
    having?: UserQuotaScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UserQuotaCountAggregateInputType | true
    _avg?: UserQuotaAvgAggregateInputType
    _sum?: UserQuotaSumAggregateInputType
    _min?: UserQuotaMinAggregateInputType
    _max?: UserQuotaMaxAggregateInputType
  }

  export type UserQuotaGroupByOutputType = {
    id: string
    userIdentifier: string
    freeScansUsed: number
    paidCredits: number
    createdAt: Date
    updatedAt: Date
    _count: UserQuotaCountAggregateOutputType | null
    _avg: UserQuotaAvgAggregateOutputType | null
    _sum: UserQuotaSumAggregateOutputType | null
    _min: UserQuotaMinAggregateOutputType | null
    _max: UserQuotaMaxAggregateOutputType | null
  }

  type GetUserQuotaGroupByPayload<T extends UserQuotaGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserQuotaGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UserQuotaGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UserQuotaGroupByOutputType[P]>
            : GetScalarType<T[P], UserQuotaGroupByOutputType[P]>
        }
      >
    >


  export type UserQuotaSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userIdentifier?: boolean
    freeScansUsed?: boolean
    paidCredits?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["userQuota"]>

  export type UserQuotaSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userIdentifier?: boolean
    freeScansUsed?: boolean
    paidCredits?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["userQuota"]>

  export type UserQuotaSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userIdentifier?: boolean
    freeScansUsed?: boolean
    paidCredits?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["userQuota"]>

  export type UserQuotaSelectScalar = {
    id?: boolean
    userIdentifier?: boolean
    freeScansUsed?: boolean
    paidCredits?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type UserQuotaOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "userIdentifier" | "freeScansUsed" | "paidCredits" | "createdAt" | "updatedAt", ExtArgs["result"]["userQuota"]>

  export type $UserQuotaPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "UserQuota"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      userIdentifier: string
      freeScansUsed: number
      paidCredits: number
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["userQuota"]>
    composites: {}
  }

  type UserQuotaGetPayload<S extends boolean | null | undefined | UserQuotaDefaultArgs> = $Result.GetResult<Prisma.$UserQuotaPayload, S>

  type UserQuotaCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<UserQuotaFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: UserQuotaCountAggregateInputType | true
    }

  export interface UserQuotaDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['UserQuota'], meta: { name: 'UserQuota' } }
    /**
     * Find zero or one UserQuota that matches the filter.
     * @param {UserQuotaFindUniqueArgs} args - Arguments to find a UserQuota
     * @example
     * // Get one UserQuota
     * const userQuota = await prisma.userQuota.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserQuotaFindUniqueArgs>(args: SelectSubset<T, UserQuotaFindUniqueArgs<ExtArgs>>): Prisma__UserQuotaClient<$Result.GetResult<Prisma.$UserQuotaPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one UserQuota that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {UserQuotaFindUniqueOrThrowArgs} args - Arguments to find a UserQuota
     * @example
     * // Get one UserQuota
     * const userQuota = await prisma.userQuota.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserQuotaFindUniqueOrThrowArgs>(args: SelectSubset<T, UserQuotaFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UserQuotaClient<$Result.GetResult<Prisma.$UserQuotaPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first UserQuota that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserQuotaFindFirstArgs} args - Arguments to find a UserQuota
     * @example
     * // Get one UserQuota
     * const userQuota = await prisma.userQuota.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserQuotaFindFirstArgs>(args?: SelectSubset<T, UserQuotaFindFirstArgs<ExtArgs>>): Prisma__UserQuotaClient<$Result.GetResult<Prisma.$UserQuotaPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first UserQuota that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserQuotaFindFirstOrThrowArgs} args - Arguments to find a UserQuota
     * @example
     * // Get one UserQuota
     * const userQuota = await prisma.userQuota.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserQuotaFindFirstOrThrowArgs>(args?: SelectSubset<T, UserQuotaFindFirstOrThrowArgs<ExtArgs>>): Prisma__UserQuotaClient<$Result.GetResult<Prisma.$UserQuotaPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more UserQuotas that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserQuotaFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all UserQuotas
     * const userQuotas = await prisma.userQuota.findMany()
     * 
     * // Get first 10 UserQuotas
     * const userQuotas = await prisma.userQuota.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const userQuotaWithIdOnly = await prisma.userQuota.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends UserQuotaFindManyArgs>(args?: SelectSubset<T, UserQuotaFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserQuotaPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a UserQuota.
     * @param {UserQuotaCreateArgs} args - Arguments to create a UserQuota.
     * @example
     * // Create one UserQuota
     * const UserQuota = await prisma.userQuota.create({
     *   data: {
     *     // ... data to create a UserQuota
     *   }
     * })
     * 
     */
    create<T extends UserQuotaCreateArgs>(args: SelectSubset<T, UserQuotaCreateArgs<ExtArgs>>): Prisma__UserQuotaClient<$Result.GetResult<Prisma.$UserQuotaPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many UserQuotas.
     * @param {UserQuotaCreateManyArgs} args - Arguments to create many UserQuotas.
     * @example
     * // Create many UserQuotas
     * const userQuota = await prisma.userQuota.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UserQuotaCreateManyArgs>(args?: SelectSubset<T, UserQuotaCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many UserQuotas and returns the data saved in the database.
     * @param {UserQuotaCreateManyAndReturnArgs} args - Arguments to create many UserQuotas.
     * @example
     * // Create many UserQuotas
     * const userQuota = await prisma.userQuota.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many UserQuotas and only return the `id`
     * const userQuotaWithIdOnly = await prisma.userQuota.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends UserQuotaCreateManyAndReturnArgs>(args?: SelectSubset<T, UserQuotaCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserQuotaPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a UserQuota.
     * @param {UserQuotaDeleteArgs} args - Arguments to delete one UserQuota.
     * @example
     * // Delete one UserQuota
     * const UserQuota = await prisma.userQuota.delete({
     *   where: {
     *     // ... filter to delete one UserQuota
     *   }
     * })
     * 
     */
    delete<T extends UserQuotaDeleteArgs>(args: SelectSubset<T, UserQuotaDeleteArgs<ExtArgs>>): Prisma__UserQuotaClient<$Result.GetResult<Prisma.$UserQuotaPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one UserQuota.
     * @param {UserQuotaUpdateArgs} args - Arguments to update one UserQuota.
     * @example
     * // Update one UserQuota
     * const userQuota = await prisma.userQuota.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UserQuotaUpdateArgs>(args: SelectSubset<T, UserQuotaUpdateArgs<ExtArgs>>): Prisma__UserQuotaClient<$Result.GetResult<Prisma.$UserQuotaPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more UserQuotas.
     * @param {UserQuotaDeleteManyArgs} args - Arguments to filter UserQuotas to delete.
     * @example
     * // Delete a few UserQuotas
     * const { count } = await prisma.userQuota.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UserQuotaDeleteManyArgs>(args?: SelectSubset<T, UserQuotaDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more UserQuotas.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserQuotaUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many UserQuotas
     * const userQuota = await prisma.userQuota.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UserQuotaUpdateManyArgs>(args: SelectSubset<T, UserQuotaUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more UserQuotas and returns the data updated in the database.
     * @param {UserQuotaUpdateManyAndReturnArgs} args - Arguments to update many UserQuotas.
     * @example
     * // Update many UserQuotas
     * const userQuota = await prisma.userQuota.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more UserQuotas and only return the `id`
     * const userQuotaWithIdOnly = await prisma.userQuota.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends UserQuotaUpdateManyAndReturnArgs>(args: SelectSubset<T, UserQuotaUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserQuotaPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one UserQuota.
     * @param {UserQuotaUpsertArgs} args - Arguments to update or create a UserQuota.
     * @example
     * // Update or create a UserQuota
     * const userQuota = await prisma.userQuota.upsert({
     *   create: {
     *     // ... data to create a UserQuota
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the UserQuota we want to update
     *   }
     * })
     */
    upsert<T extends UserQuotaUpsertArgs>(args: SelectSubset<T, UserQuotaUpsertArgs<ExtArgs>>): Prisma__UserQuotaClient<$Result.GetResult<Prisma.$UserQuotaPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of UserQuotas.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserQuotaCountArgs} args - Arguments to filter UserQuotas to count.
     * @example
     * // Count the number of UserQuotas
     * const count = await prisma.userQuota.count({
     *   where: {
     *     // ... the filter for the UserQuotas we want to count
     *   }
     * })
    **/
    count<T extends UserQuotaCountArgs>(
      args?: Subset<T, UserQuotaCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UserQuotaCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a UserQuota.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserQuotaAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends UserQuotaAggregateArgs>(args: Subset<T, UserQuotaAggregateArgs>): Prisma.PrismaPromise<GetUserQuotaAggregateType<T>>

    /**
     * Group by UserQuota.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserQuotaGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends UserQuotaGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserQuotaGroupByArgs['orderBy'] }
        : { orderBy?: UserQuotaGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, UserQuotaGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserQuotaGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the UserQuota model
   */
  readonly fields: UserQuotaFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for UserQuota.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserQuotaClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the UserQuota model
   */
  interface UserQuotaFieldRefs {
    readonly id: FieldRef<"UserQuota", 'String'>
    readonly userIdentifier: FieldRef<"UserQuota", 'String'>
    readonly freeScansUsed: FieldRef<"UserQuota", 'Int'>
    readonly paidCredits: FieldRef<"UserQuota", 'Int'>
    readonly createdAt: FieldRef<"UserQuota", 'DateTime'>
    readonly updatedAt: FieldRef<"UserQuota", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * UserQuota findUnique
   */
  export type UserQuotaFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserQuota
     */
    select?: UserQuotaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserQuota
     */
    omit?: UserQuotaOmit<ExtArgs> | null
    /**
     * Filter, which UserQuota to fetch.
     */
    where: UserQuotaWhereUniqueInput
  }

  /**
   * UserQuota findUniqueOrThrow
   */
  export type UserQuotaFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserQuota
     */
    select?: UserQuotaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserQuota
     */
    omit?: UserQuotaOmit<ExtArgs> | null
    /**
     * Filter, which UserQuota to fetch.
     */
    where: UserQuotaWhereUniqueInput
  }

  /**
   * UserQuota findFirst
   */
  export type UserQuotaFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserQuota
     */
    select?: UserQuotaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserQuota
     */
    omit?: UserQuotaOmit<ExtArgs> | null
    /**
     * Filter, which UserQuota to fetch.
     */
    where?: UserQuotaWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserQuotas to fetch.
     */
    orderBy?: UserQuotaOrderByWithRelationInput | UserQuotaOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for UserQuotas.
     */
    cursor?: UserQuotaWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserQuotas from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserQuotas.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of UserQuotas.
     */
    distinct?: UserQuotaScalarFieldEnum | UserQuotaScalarFieldEnum[]
  }

  /**
   * UserQuota findFirstOrThrow
   */
  export type UserQuotaFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserQuota
     */
    select?: UserQuotaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserQuota
     */
    omit?: UserQuotaOmit<ExtArgs> | null
    /**
     * Filter, which UserQuota to fetch.
     */
    where?: UserQuotaWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserQuotas to fetch.
     */
    orderBy?: UserQuotaOrderByWithRelationInput | UserQuotaOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for UserQuotas.
     */
    cursor?: UserQuotaWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserQuotas from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserQuotas.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of UserQuotas.
     */
    distinct?: UserQuotaScalarFieldEnum | UserQuotaScalarFieldEnum[]
  }

  /**
   * UserQuota findMany
   */
  export type UserQuotaFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserQuota
     */
    select?: UserQuotaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserQuota
     */
    omit?: UserQuotaOmit<ExtArgs> | null
    /**
     * Filter, which UserQuotas to fetch.
     */
    where?: UserQuotaWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserQuotas to fetch.
     */
    orderBy?: UserQuotaOrderByWithRelationInput | UserQuotaOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing UserQuotas.
     */
    cursor?: UserQuotaWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserQuotas from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserQuotas.
     */
    skip?: number
    distinct?: UserQuotaScalarFieldEnum | UserQuotaScalarFieldEnum[]
  }

  /**
   * UserQuota create
   */
  export type UserQuotaCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserQuota
     */
    select?: UserQuotaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserQuota
     */
    omit?: UserQuotaOmit<ExtArgs> | null
    /**
     * The data needed to create a UserQuota.
     */
    data: XOR<UserQuotaCreateInput, UserQuotaUncheckedCreateInput>
  }

  /**
   * UserQuota createMany
   */
  export type UserQuotaCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many UserQuotas.
     */
    data: UserQuotaCreateManyInput | UserQuotaCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * UserQuota createManyAndReturn
   */
  export type UserQuotaCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserQuota
     */
    select?: UserQuotaSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the UserQuota
     */
    omit?: UserQuotaOmit<ExtArgs> | null
    /**
     * The data used to create many UserQuotas.
     */
    data: UserQuotaCreateManyInput | UserQuotaCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * UserQuota update
   */
  export type UserQuotaUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserQuota
     */
    select?: UserQuotaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserQuota
     */
    omit?: UserQuotaOmit<ExtArgs> | null
    /**
     * The data needed to update a UserQuota.
     */
    data: XOR<UserQuotaUpdateInput, UserQuotaUncheckedUpdateInput>
    /**
     * Choose, which UserQuota to update.
     */
    where: UserQuotaWhereUniqueInput
  }

  /**
   * UserQuota updateMany
   */
  export type UserQuotaUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update UserQuotas.
     */
    data: XOR<UserQuotaUpdateManyMutationInput, UserQuotaUncheckedUpdateManyInput>
    /**
     * Filter which UserQuotas to update
     */
    where?: UserQuotaWhereInput
    /**
     * Limit how many UserQuotas to update.
     */
    limit?: number
  }

  /**
   * UserQuota updateManyAndReturn
   */
  export type UserQuotaUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserQuota
     */
    select?: UserQuotaSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the UserQuota
     */
    omit?: UserQuotaOmit<ExtArgs> | null
    /**
     * The data used to update UserQuotas.
     */
    data: XOR<UserQuotaUpdateManyMutationInput, UserQuotaUncheckedUpdateManyInput>
    /**
     * Filter which UserQuotas to update
     */
    where?: UserQuotaWhereInput
    /**
     * Limit how many UserQuotas to update.
     */
    limit?: number
  }

  /**
   * UserQuota upsert
   */
  export type UserQuotaUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserQuota
     */
    select?: UserQuotaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserQuota
     */
    omit?: UserQuotaOmit<ExtArgs> | null
    /**
     * The filter to search for the UserQuota to update in case it exists.
     */
    where: UserQuotaWhereUniqueInput
    /**
     * In case the UserQuota found by the `where` argument doesn't exist, create a new UserQuota with this data.
     */
    create: XOR<UserQuotaCreateInput, UserQuotaUncheckedCreateInput>
    /**
     * In case the UserQuota was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserQuotaUpdateInput, UserQuotaUncheckedUpdateInput>
  }

  /**
   * UserQuota delete
   */
  export type UserQuotaDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserQuota
     */
    select?: UserQuotaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserQuota
     */
    omit?: UserQuotaOmit<ExtArgs> | null
    /**
     * Filter which UserQuota to delete.
     */
    where: UserQuotaWhereUniqueInput
  }

  /**
   * UserQuota deleteMany
   */
  export type UserQuotaDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which UserQuotas to delete
     */
    where?: UserQuotaWhereInput
    /**
     * Limit how many UserQuotas to delete.
     */
    limit?: number
  }

  /**
   * UserQuota without action
   */
  export type UserQuotaDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserQuota
     */
    select?: UserQuotaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserQuota
     */
    omit?: UserQuotaOmit<ExtArgs> | null
  }


  /**
   * Model StripePayment
   */

  export type AggregateStripePayment = {
    _count: StripePaymentCountAggregateOutputType | null
    _avg: StripePaymentAvgAggregateOutputType | null
    _sum: StripePaymentSumAggregateOutputType | null
    _min: StripePaymentMinAggregateOutputType | null
    _max: StripePaymentMaxAggregateOutputType | null
  }

  export type StripePaymentAvgAggregateOutputType = {
    amountCents: number | null
  }

  export type StripePaymentSumAggregateOutputType = {
    amountCents: number | null
  }

  export type StripePaymentMinAggregateOutputType = {
    id: string | null
    sessionId: string | null
    userIdentifier: string | null
    amountCents: number | null
    status: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type StripePaymentMaxAggregateOutputType = {
    id: string | null
    sessionId: string | null
    userIdentifier: string | null
    amountCents: number | null
    status: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type StripePaymentCountAggregateOutputType = {
    id: number
    sessionId: number
    userIdentifier: number
    amountCents: number
    status: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type StripePaymentAvgAggregateInputType = {
    amountCents?: true
  }

  export type StripePaymentSumAggregateInputType = {
    amountCents?: true
  }

  export type StripePaymentMinAggregateInputType = {
    id?: true
    sessionId?: true
    userIdentifier?: true
    amountCents?: true
    status?: true
    createdAt?: true
    updatedAt?: true
  }

  export type StripePaymentMaxAggregateInputType = {
    id?: true
    sessionId?: true
    userIdentifier?: true
    amountCents?: true
    status?: true
    createdAt?: true
    updatedAt?: true
  }

  export type StripePaymentCountAggregateInputType = {
    id?: true
    sessionId?: true
    userIdentifier?: true
    amountCents?: true
    status?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type StripePaymentAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which StripePayment to aggregate.
     */
    where?: StripePaymentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of StripePayments to fetch.
     */
    orderBy?: StripePaymentOrderByWithRelationInput | StripePaymentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: StripePaymentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` StripePayments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` StripePayments.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned StripePayments
    **/
    _count?: true | StripePaymentCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: StripePaymentAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: StripePaymentSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: StripePaymentMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: StripePaymentMaxAggregateInputType
  }

  export type GetStripePaymentAggregateType<T extends StripePaymentAggregateArgs> = {
        [P in keyof T & keyof AggregateStripePayment]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateStripePayment[P]>
      : GetScalarType<T[P], AggregateStripePayment[P]>
  }




  export type StripePaymentGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: StripePaymentWhereInput
    orderBy?: StripePaymentOrderByWithAggregationInput | StripePaymentOrderByWithAggregationInput[]
    by: StripePaymentScalarFieldEnum[] | StripePaymentScalarFieldEnum
    having?: StripePaymentScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: StripePaymentCountAggregateInputType | true
    _avg?: StripePaymentAvgAggregateInputType
    _sum?: StripePaymentSumAggregateInputType
    _min?: StripePaymentMinAggregateInputType
    _max?: StripePaymentMaxAggregateInputType
  }

  export type StripePaymentGroupByOutputType = {
    id: string
    sessionId: string
    userIdentifier: string
    amountCents: number
    status: string
    createdAt: Date
    updatedAt: Date
    _count: StripePaymentCountAggregateOutputType | null
    _avg: StripePaymentAvgAggregateOutputType | null
    _sum: StripePaymentSumAggregateOutputType | null
    _min: StripePaymentMinAggregateOutputType | null
    _max: StripePaymentMaxAggregateOutputType | null
  }

  type GetStripePaymentGroupByPayload<T extends StripePaymentGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<StripePaymentGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof StripePaymentGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], StripePaymentGroupByOutputType[P]>
            : GetScalarType<T[P], StripePaymentGroupByOutputType[P]>
        }
      >
    >


  export type StripePaymentSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    sessionId?: boolean
    userIdentifier?: boolean
    amountCents?: boolean
    status?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["stripePayment"]>

  export type StripePaymentSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    sessionId?: boolean
    userIdentifier?: boolean
    amountCents?: boolean
    status?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["stripePayment"]>

  export type StripePaymentSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    sessionId?: boolean
    userIdentifier?: boolean
    amountCents?: boolean
    status?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["stripePayment"]>

  export type StripePaymentSelectScalar = {
    id?: boolean
    sessionId?: boolean
    userIdentifier?: boolean
    amountCents?: boolean
    status?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type StripePaymentOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "sessionId" | "userIdentifier" | "amountCents" | "status" | "createdAt" | "updatedAt", ExtArgs["result"]["stripePayment"]>

  export type $StripePaymentPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "StripePayment"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      sessionId: string
      userIdentifier: string
      amountCents: number
      status: string
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["stripePayment"]>
    composites: {}
  }

  type StripePaymentGetPayload<S extends boolean | null | undefined | StripePaymentDefaultArgs> = $Result.GetResult<Prisma.$StripePaymentPayload, S>

  type StripePaymentCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<StripePaymentFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: StripePaymentCountAggregateInputType | true
    }

  export interface StripePaymentDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['StripePayment'], meta: { name: 'StripePayment' } }
    /**
     * Find zero or one StripePayment that matches the filter.
     * @param {StripePaymentFindUniqueArgs} args - Arguments to find a StripePayment
     * @example
     * // Get one StripePayment
     * const stripePayment = await prisma.stripePayment.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends StripePaymentFindUniqueArgs>(args: SelectSubset<T, StripePaymentFindUniqueArgs<ExtArgs>>): Prisma__StripePaymentClient<$Result.GetResult<Prisma.$StripePaymentPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one StripePayment that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {StripePaymentFindUniqueOrThrowArgs} args - Arguments to find a StripePayment
     * @example
     * // Get one StripePayment
     * const stripePayment = await prisma.stripePayment.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends StripePaymentFindUniqueOrThrowArgs>(args: SelectSubset<T, StripePaymentFindUniqueOrThrowArgs<ExtArgs>>): Prisma__StripePaymentClient<$Result.GetResult<Prisma.$StripePaymentPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first StripePayment that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StripePaymentFindFirstArgs} args - Arguments to find a StripePayment
     * @example
     * // Get one StripePayment
     * const stripePayment = await prisma.stripePayment.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends StripePaymentFindFirstArgs>(args?: SelectSubset<T, StripePaymentFindFirstArgs<ExtArgs>>): Prisma__StripePaymentClient<$Result.GetResult<Prisma.$StripePaymentPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first StripePayment that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StripePaymentFindFirstOrThrowArgs} args - Arguments to find a StripePayment
     * @example
     * // Get one StripePayment
     * const stripePayment = await prisma.stripePayment.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends StripePaymentFindFirstOrThrowArgs>(args?: SelectSubset<T, StripePaymentFindFirstOrThrowArgs<ExtArgs>>): Prisma__StripePaymentClient<$Result.GetResult<Prisma.$StripePaymentPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more StripePayments that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StripePaymentFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all StripePayments
     * const stripePayments = await prisma.stripePayment.findMany()
     * 
     * // Get first 10 StripePayments
     * const stripePayments = await prisma.stripePayment.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const stripePaymentWithIdOnly = await prisma.stripePayment.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends StripePaymentFindManyArgs>(args?: SelectSubset<T, StripePaymentFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$StripePaymentPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a StripePayment.
     * @param {StripePaymentCreateArgs} args - Arguments to create a StripePayment.
     * @example
     * // Create one StripePayment
     * const StripePayment = await prisma.stripePayment.create({
     *   data: {
     *     // ... data to create a StripePayment
     *   }
     * })
     * 
     */
    create<T extends StripePaymentCreateArgs>(args: SelectSubset<T, StripePaymentCreateArgs<ExtArgs>>): Prisma__StripePaymentClient<$Result.GetResult<Prisma.$StripePaymentPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many StripePayments.
     * @param {StripePaymentCreateManyArgs} args - Arguments to create many StripePayments.
     * @example
     * // Create many StripePayments
     * const stripePayment = await prisma.stripePayment.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends StripePaymentCreateManyArgs>(args?: SelectSubset<T, StripePaymentCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many StripePayments and returns the data saved in the database.
     * @param {StripePaymentCreateManyAndReturnArgs} args - Arguments to create many StripePayments.
     * @example
     * // Create many StripePayments
     * const stripePayment = await prisma.stripePayment.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many StripePayments and only return the `id`
     * const stripePaymentWithIdOnly = await prisma.stripePayment.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends StripePaymentCreateManyAndReturnArgs>(args?: SelectSubset<T, StripePaymentCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$StripePaymentPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a StripePayment.
     * @param {StripePaymentDeleteArgs} args - Arguments to delete one StripePayment.
     * @example
     * // Delete one StripePayment
     * const StripePayment = await prisma.stripePayment.delete({
     *   where: {
     *     // ... filter to delete one StripePayment
     *   }
     * })
     * 
     */
    delete<T extends StripePaymentDeleteArgs>(args: SelectSubset<T, StripePaymentDeleteArgs<ExtArgs>>): Prisma__StripePaymentClient<$Result.GetResult<Prisma.$StripePaymentPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one StripePayment.
     * @param {StripePaymentUpdateArgs} args - Arguments to update one StripePayment.
     * @example
     * // Update one StripePayment
     * const stripePayment = await prisma.stripePayment.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends StripePaymentUpdateArgs>(args: SelectSubset<T, StripePaymentUpdateArgs<ExtArgs>>): Prisma__StripePaymentClient<$Result.GetResult<Prisma.$StripePaymentPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more StripePayments.
     * @param {StripePaymentDeleteManyArgs} args - Arguments to filter StripePayments to delete.
     * @example
     * // Delete a few StripePayments
     * const { count } = await prisma.stripePayment.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends StripePaymentDeleteManyArgs>(args?: SelectSubset<T, StripePaymentDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more StripePayments.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StripePaymentUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many StripePayments
     * const stripePayment = await prisma.stripePayment.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends StripePaymentUpdateManyArgs>(args: SelectSubset<T, StripePaymentUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more StripePayments and returns the data updated in the database.
     * @param {StripePaymentUpdateManyAndReturnArgs} args - Arguments to update many StripePayments.
     * @example
     * // Update many StripePayments
     * const stripePayment = await prisma.stripePayment.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more StripePayments and only return the `id`
     * const stripePaymentWithIdOnly = await prisma.stripePayment.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends StripePaymentUpdateManyAndReturnArgs>(args: SelectSubset<T, StripePaymentUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$StripePaymentPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one StripePayment.
     * @param {StripePaymentUpsertArgs} args - Arguments to update or create a StripePayment.
     * @example
     * // Update or create a StripePayment
     * const stripePayment = await prisma.stripePayment.upsert({
     *   create: {
     *     // ... data to create a StripePayment
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the StripePayment we want to update
     *   }
     * })
     */
    upsert<T extends StripePaymentUpsertArgs>(args: SelectSubset<T, StripePaymentUpsertArgs<ExtArgs>>): Prisma__StripePaymentClient<$Result.GetResult<Prisma.$StripePaymentPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of StripePayments.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StripePaymentCountArgs} args - Arguments to filter StripePayments to count.
     * @example
     * // Count the number of StripePayments
     * const count = await prisma.stripePayment.count({
     *   where: {
     *     // ... the filter for the StripePayments we want to count
     *   }
     * })
    **/
    count<T extends StripePaymentCountArgs>(
      args?: Subset<T, StripePaymentCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], StripePaymentCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a StripePayment.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StripePaymentAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends StripePaymentAggregateArgs>(args: Subset<T, StripePaymentAggregateArgs>): Prisma.PrismaPromise<GetStripePaymentAggregateType<T>>

    /**
     * Group by StripePayment.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StripePaymentGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends StripePaymentGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: StripePaymentGroupByArgs['orderBy'] }
        : { orderBy?: StripePaymentGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, StripePaymentGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetStripePaymentGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the StripePayment model
   */
  readonly fields: StripePaymentFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for StripePayment.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__StripePaymentClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the StripePayment model
   */
  interface StripePaymentFieldRefs {
    readonly id: FieldRef<"StripePayment", 'String'>
    readonly sessionId: FieldRef<"StripePayment", 'String'>
    readonly userIdentifier: FieldRef<"StripePayment", 'String'>
    readonly amountCents: FieldRef<"StripePayment", 'Int'>
    readonly status: FieldRef<"StripePayment", 'String'>
    readonly createdAt: FieldRef<"StripePayment", 'DateTime'>
    readonly updatedAt: FieldRef<"StripePayment", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * StripePayment findUnique
   */
  export type StripePaymentFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StripePayment
     */
    select?: StripePaymentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the StripePayment
     */
    omit?: StripePaymentOmit<ExtArgs> | null
    /**
     * Filter, which StripePayment to fetch.
     */
    where: StripePaymentWhereUniqueInput
  }

  /**
   * StripePayment findUniqueOrThrow
   */
  export type StripePaymentFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StripePayment
     */
    select?: StripePaymentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the StripePayment
     */
    omit?: StripePaymentOmit<ExtArgs> | null
    /**
     * Filter, which StripePayment to fetch.
     */
    where: StripePaymentWhereUniqueInput
  }

  /**
   * StripePayment findFirst
   */
  export type StripePaymentFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StripePayment
     */
    select?: StripePaymentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the StripePayment
     */
    omit?: StripePaymentOmit<ExtArgs> | null
    /**
     * Filter, which StripePayment to fetch.
     */
    where?: StripePaymentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of StripePayments to fetch.
     */
    orderBy?: StripePaymentOrderByWithRelationInput | StripePaymentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for StripePayments.
     */
    cursor?: StripePaymentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` StripePayments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` StripePayments.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of StripePayments.
     */
    distinct?: StripePaymentScalarFieldEnum | StripePaymentScalarFieldEnum[]
  }

  /**
   * StripePayment findFirstOrThrow
   */
  export type StripePaymentFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StripePayment
     */
    select?: StripePaymentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the StripePayment
     */
    omit?: StripePaymentOmit<ExtArgs> | null
    /**
     * Filter, which StripePayment to fetch.
     */
    where?: StripePaymentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of StripePayments to fetch.
     */
    orderBy?: StripePaymentOrderByWithRelationInput | StripePaymentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for StripePayments.
     */
    cursor?: StripePaymentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` StripePayments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` StripePayments.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of StripePayments.
     */
    distinct?: StripePaymentScalarFieldEnum | StripePaymentScalarFieldEnum[]
  }

  /**
   * StripePayment findMany
   */
  export type StripePaymentFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StripePayment
     */
    select?: StripePaymentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the StripePayment
     */
    omit?: StripePaymentOmit<ExtArgs> | null
    /**
     * Filter, which StripePayments to fetch.
     */
    where?: StripePaymentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of StripePayments to fetch.
     */
    orderBy?: StripePaymentOrderByWithRelationInput | StripePaymentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing StripePayments.
     */
    cursor?: StripePaymentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` StripePayments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` StripePayments.
     */
    skip?: number
    distinct?: StripePaymentScalarFieldEnum | StripePaymentScalarFieldEnum[]
  }

  /**
   * StripePayment create
   */
  export type StripePaymentCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StripePayment
     */
    select?: StripePaymentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the StripePayment
     */
    omit?: StripePaymentOmit<ExtArgs> | null
    /**
     * The data needed to create a StripePayment.
     */
    data: XOR<StripePaymentCreateInput, StripePaymentUncheckedCreateInput>
  }

  /**
   * StripePayment createMany
   */
  export type StripePaymentCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many StripePayments.
     */
    data: StripePaymentCreateManyInput | StripePaymentCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * StripePayment createManyAndReturn
   */
  export type StripePaymentCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StripePayment
     */
    select?: StripePaymentSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the StripePayment
     */
    omit?: StripePaymentOmit<ExtArgs> | null
    /**
     * The data used to create many StripePayments.
     */
    data: StripePaymentCreateManyInput | StripePaymentCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * StripePayment update
   */
  export type StripePaymentUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StripePayment
     */
    select?: StripePaymentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the StripePayment
     */
    omit?: StripePaymentOmit<ExtArgs> | null
    /**
     * The data needed to update a StripePayment.
     */
    data: XOR<StripePaymentUpdateInput, StripePaymentUncheckedUpdateInput>
    /**
     * Choose, which StripePayment to update.
     */
    where: StripePaymentWhereUniqueInput
  }

  /**
   * StripePayment updateMany
   */
  export type StripePaymentUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update StripePayments.
     */
    data: XOR<StripePaymentUpdateManyMutationInput, StripePaymentUncheckedUpdateManyInput>
    /**
     * Filter which StripePayments to update
     */
    where?: StripePaymentWhereInput
    /**
     * Limit how many StripePayments to update.
     */
    limit?: number
  }

  /**
   * StripePayment updateManyAndReturn
   */
  export type StripePaymentUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StripePayment
     */
    select?: StripePaymentSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the StripePayment
     */
    omit?: StripePaymentOmit<ExtArgs> | null
    /**
     * The data used to update StripePayments.
     */
    data: XOR<StripePaymentUpdateManyMutationInput, StripePaymentUncheckedUpdateManyInput>
    /**
     * Filter which StripePayments to update
     */
    where?: StripePaymentWhereInput
    /**
     * Limit how many StripePayments to update.
     */
    limit?: number
  }

  /**
   * StripePayment upsert
   */
  export type StripePaymentUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StripePayment
     */
    select?: StripePaymentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the StripePayment
     */
    omit?: StripePaymentOmit<ExtArgs> | null
    /**
     * The filter to search for the StripePayment to update in case it exists.
     */
    where: StripePaymentWhereUniqueInput
    /**
     * In case the StripePayment found by the `where` argument doesn't exist, create a new StripePayment with this data.
     */
    create: XOR<StripePaymentCreateInput, StripePaymentUncheckedCreateInput>
    /**
     * In case the StripePayment was found with the provided `where` argument, update it with this data.
     */
    update: XOR<StripePaymentUpdateInput, StripePaymentUncheckedUpdateInput>
  }

  /**
   * StripePayment delete
   */
  export type StripePaymentDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StripePayment
     */
    select?: StripePaymentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the StripePayment
     */
    omit?: StripePaymentOmit<ExtArgs> | null
    /**
     * Filter which StripePayment to delete.
     */
    where: StripePaymentWhereUniqueInput
  }

  /**
   * StripePayment deleteMany
   */
  export type StripePaymentDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which StripePayments to delete
     */
    where?: StripePaymentWhereInput
    /**
     * Limit how many StripePayments to delete.
     */
    limit?: number
  }

  /**
   * StripePayment without action
   */
  export type StripePaymentDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StripePayment
     */
    select?: StripePaymentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the StripePayment
     */
    omit?: StripePaymentOmit<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const ScanScalarFieldEnum: {
    id: 'id',
    createdAt: 'createdAt',
    status: 'status',
    engagement: 'engagement',
    fileKey: 'fileKey',
    originalName: 'originalName',
    mimeType: 'mimeType',
    size: 'size',
    resultJson: 'resultJson',
    userIdentifier: 'userIdentifier'
  };

  export type ScanScalarFieldEnum = (typeof ScanScalarFieldEnum)[keyof typeof ScanScalarFieldEnum]


  export const UserQuotaScalarFieldEnum: {
    id: 'id',
    userIdentifier: 'userIdentifier',
    freeScansUsed: 'freeScansUsed',
    paidCredits: 'paidCredits',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type UserQuotaScalarFieldEnum = (typeof UserQuotaScalarFieldEnum)[keyof typeof UserQuotaScalarFieldEnum]


  export const StripePaymentScalarFieldEnum: {
    id: 'id',
    sessionId: 'sessionId',
    userIdentifier: 'userIdentifier',
    amountCents: 'amountCents',
    status: 'status',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type StripePaymentScalarFieldEnum = (typeof StripePaymentScalarFieldEnum)[keyof typeof StripePaymentScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const NullableJsonNullValueInput: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull
  };

  export type NullableJsonNullValueInput = (typeof NullableJsonNullValueInput)[keyof typeof NullableJsonNullValueInput]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const JsonNullValueFilter: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull,
    AnyNull: typeof AnyNull
  };

  export type JsonNullValueFilter = (typeof JsonNullValueFilter)[keyof typeof JsonNullValueFilter]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'Json'
   */
  export type JsonFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Json'>
    


  /**
   * Reference to a field of type 'QueryMode'
   */
  export type EnumQueryModeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'QueryMode'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    
  /**
   * Deep Input Types
   */


  export type ScanWhereInput = {
    AND?: ScanWhereInput | ScanWhereInput[]
    OR?: ScanWhereInput[]
    NOT?: ScanWhereInput | ScanWhereInput[]
    id?: StringFilter<"Scan"> | string
    createdAt?: DateTimeFilter<"Scan"> | Date | string
    status?: StringFilter<"Scan"> | string
    engagement?: StringNullableFilter<"Scan"> | string | null
    fileKey?: StringNullableFilter<"Scan"> | string | null
    originalName?: StringNullableFilter<"Scan"> | string | null
    mimeType?: StringNullableFilter<"Scan"> | string | null
    size?: IntNullableFilter<"Scan"> | number | null
    resultJson?: JsonNullableFilter<"Scan">
    userIdentifier?: StringNullableFilter<"Scan"> | string | null
  }

  export type ScanOrderByWithRelationInput = {
    id?: SortOrder
    createdAt?: SortOrder
    status?: SortOrder
    engagement?: SortOrderInput | SortOrder
    fileKey?: SortOrderInput | SortOrder
    originalName?: SortOrderInput | SortOrder
    mimeType?: SortOrderInput | SortOrder
    size?: SortOrderInput | SortOrder
    resultJson?: SortOrderInput | SortOrder
    userIdentifier?: SortOrderInput | SortOrder
  }

  export type ScanWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: ScanWhereInput | ScanWhereInput[]
    OR?: ScanWhereInput[]
    NOT?: ScanWhereInput | ScanWhereInput[]
    createdAt?: DateTimeFilter<"Scan"> | Date | string
    status?: StringFilter<"Scan"> | string
    engagement?: StringNullableFilter<"Scan"> | string | null
    fileKey?: StringNullableFilter<"Scan"> | string | null
    originalName?: StringNullableFilter<"Scan"> | string | null
    mimeType?: StringNullableFilter<"Scan"> | string | null
    size?: IntNullableFilter<"Scan"> | number | null
    resultJson?: JsonNullableFilter<"Scan">
    userIdentifier?: StringNullableFilter<"Scan"> | string | null
  }, "id">

  export type ScanOrderByWithAggregationInput = {
    id?: SortOrder
    createdAt?: SortOrder
    status?: SortOrder
    engagement?: SortOrderInput | SortOrder
    fileKey?: SortOrderInput | SortOrder
    originalName?: SortOrderInput | SortOrder
    mimeType?: SortOrderInput | SortOrder
    size?: SortOrderInput | SortOrder
    resultJson?: SortOrderInput | SortOrder
    userIdentifier?: SortOrderInput | SortOrder
    _count?: ScanCountOrderByAggregateInput
    _avg?: ScanAvgOrderByAggregateInput
    _max?: ScanMaxOrderByAggregateInput
    _min?: ScanMinOrderByAggregateInput
    _sum?: ScanSumOrderByAggregateInput
  }

  export type ScanScalarWhereWithAggregatesInput = {
    AND?: ScanScalarWhereWithAggregatesInput | ScanScalarWhereWithAggregatesInput[]
    OR?: ScanScalarWhereWithAggregatesInput[]
    NOT?: ScanScalarWhereWithAggregatesInput | ScanScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Scan"> | string
    createdAt?: DateTimeWithAggregatesFilter<"Scan"> | Date | string
    status?: StringWithAggregatesFilter<"Scan"> | string
    engagement?: StringNullableWithAggregatesFilter<"Scan"> | string | null
    fileKey?: StringNullableWithAggregatesFilter<"Scan"> | string | null
    originalName?: StringNullableWithAggregatesFilter<"Scan"> | string | null
    mimeType?: StringNullableWithAggregatesFilter<"Scan"> | string | null
    size?: IntNullableWithAggregatesFilter<"Scan"> | number | null
    resultJson?: JsonNullableWithAggregatesFilter<"Scan">
    userIdentifier?: StringNullableWithAggregatesFilter<"Scan"> | string | null
  }

  export type UserQuotaWhereInput = {
    AND?: UserQuotaWhereInput | UserQuotaWhereInput[]
    OR?: UserQuotaWhereInput[]
    NOT?: UserQuotaWhereInput | UserQuotaWhereInput[]
    id?: StringFilter<"UserQuota"> | string
    userIdentifier?: StringFilter<"UserQuota"> | string
    freeScansUsed?: IntFilter<"UserQuota"> | number
    paidCredits?: IntFilter<"UserQuota"> | number
    createdAt?: DateTimeFilter<"UserQuota"> | Date | string
    updatedAt?: DateTimeFilter<"UserQuota"> | Date | string
  }

  export type UserQuotaOrderByWithRelationInput = {
    id?: SortOrder
    userIdentifier?: SortOrder
    freeScansUsed?: SortOrder
    paidCredits?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserQuotaWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    userIdentifier?: string
    AND?: UserQuotaWhereInput | UserQuotaWhereInput[]
    OR?: UserQuotaWhereInput[]
    NOT?: UserQuotaWhereInput | UserQuotaWhereInput[]
    freeScansUsed?: IntFilter<"UserQuota"> | number
    paidCredits?: IntFilter<"UserQuota"> | number
    createdAt?: DateTimeFilter<"UserQuota"> | Date | string
    updatedAt?: DateTimeFilter<"UserQuota"> | Date | string
  }, "id" | "userIdentifier">

  export type UserQuotaOrderByWithAggregationInput = {
    id?: SortOrder
    userIdentifier?: SortOrder
    freeScansUsed?: SortOrder
    paidCredits?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: UserQuotaCountOrderByAggregateInput
    _avg?: UserQuotaAvgOrderByAggregateInput
    _max?: UserQuotaMaxOrderByAggregateInput
    _min?: UserQuotaMinOrderByAggregateInput
    _sum?: UserQuotaSumOrderByAggregateInput
  }

  export type UserQuotaScalarWhereWithAggregatesInput = {
    AND?: UserQuotaScalarWhereWithAggregatesInput | UserQuotaScalarWhereWithAggregatesInput[]
    OR?: UserQuotaScalarWhereWithAggregatesInput[]
    NOT?: UserQuotaScalarWhereWithAggregatesInput | UserQuotaScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"UserQuota"> | string
    userIdentifier?: StringWithAggregatesFilter<"UserQuota"> | string
    freeScansUsed?: IntWithAggregatesFilter<"UserQuota"> | number
    paidCredits?: IntWithAggregatesFilter<"UserQuota"> | number
    createdAt?: DateTimeWithAggregatesFilter<"UserQuota"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"UserQuota"> | Date | string
  }

  export type StripePaymentWhereInput = {
    AND?: StripePaymentWhereInput | StripePaymentWhereInput[]
    OR?: StripePaymentWhereInput[]
    NOT?: StripePaymentWhereInput | StripePaymentWhereInput[]
    id?: StringFilter<"StripePayment"> | string
    sessionId?: StringFilter<"StripePayment"> | string
    userIdentifier?: StringFilter<"StripePayment"> | string
    amountCents?: IntFilter<"StripePayment"> | number
    status?: StringFilter<"StripePayment"> | string
    createdAt?: DateTimeFilter<"StripePayment"> | Date | string
    updatedAt?: DateTimeFilter<"StripePayment"> | Date | string
  }

  export type StripePaymentOrderByWithRelationInput = {
    id?: SortOrder
    sessionId?: SortOrder
    userIdentifier?: SortOrder
    amountCents?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type StripePaymentWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    sessionId?: string
    AND?: StripePaymentWhereInput | StripePaymentWhereInput[]
    OR?: StripePaymentWhereInput[]
    NOT?: StripePaymentWhereInput | StripePaymentWhereInput[]
    userIdentifier?: StringFilter<"StripePayment"> | string
    amountCents?: IntFilter<"StripePayment"> | number
    status?: StringFilter<"StripePayment"> | string
    createdAt?: DateTimeFilter<"StripePayment"> | Date | string
    updatedAt?: DateTimeFilter<"StripePayment"> | Date | string
  }, "id" | "sessionId">

  export type StripePaymentOrderByWithAggregationInput = {
    id?: SortOrder
    sessionId?: SortOrder
    userIdentifier?: SortOrder
    amountCents?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: StripePaymentCountOrderByAggregateInput
    _avg?: StripePaymentAvgOrderByAggregateInput
    _max?: StripePaymentMaxOrderByAggregateInput
    _min?: StripePaymentMinOrderByAggregateInput
    _sum?: StripePaymentSumOrderByAggregateInput
  }

  export type StripePaymentScalarWhereWithAggregatesInput = {
    AND?: StripePaymentScalarWhereWithAggregatesInput | StripePaymentScalarWhereWithAggregatesInput[]
    OR?: StripePaymentScalarWhereWithAggregatesInput[]
    NOT?: StripePaymentScalarWhereWithAggregatesInput | StripePaymentScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"StripePayment"> | string
    sessionId?: StringWithAggregatesFilter<"StripePayment"> | string
    userIdentifier?: StringWithAggregatesFilter<"StripePayment"> | string
    amountCents?: IntWithAggregatesFilter<"StripePayment"> | number
    status?: StringWithAggregatesFilter<"StripePayment"> | string
    createdAt?: DateTimeWithAggregatesFilter<"StripePayment"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"StripePayment"> | Date | string
  }

  export type ScanCreateInput = {
    id?: string
    createdAt?: Date | string
    status: string
    engagement?: string | null
    fileKey?: string | null
    originalName?: string | null
    mimeType?: string | null
    size?: number | null
    resultJson?: NullableJsonNullValueInput | InputJsonValue
    userIdentifier?: string | null
  }

  export type ScanUncheckedCreateInput = {
    id?: string
    createdAt?: Date | string
    status: string
    engagement?: string | null
    fileKey?: string | null
    originalName?: string | null
    mimeType?: string | null
    size?: number | null
    resultJson?: NullableJsonNullValueInput | InputJsonValue
    userIdentifier?: string | null
  }

  export type ScanUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: StringFieldUpdateOperationsInput | string
    engagement?: NullableStringFieldUpdateOperationsInput | string | null
    fileKey?: NullableStringFieldUpdateOperationsInput | string | null
    originalName?: NullableStringFieldUpdateOperationsInput | string | null
    mimeType?: NullableStringFieldUpdateOperationsInput | string | null
    size?: NullableIntFieldUpdateOperationsInput | number | null
    resultJson?: NullableJsonNullValueInput | InputJsonValue
    userIdentifier?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type ScanUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: StringFieldUpdateOperationsInput | string
    engagement?: NullableStringFieldUpdateOperationsInput | string | null
    fileKey?: NullableStringFieldUpdateOperationsInput | string | null
    originalName?: NullableStringFieldUpdateOperationsInput | string | null
    mimeType?: NullableStringFieldUpdateOperationsInput | string | null
    size?: NullableIntFieldUpdateOperationsInput | number | null
    resultJson?: NullableJsonNullValueInput | InputJsonValue
    userIdentifier?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type ScanCreateManyInput = {
    id?: string
    createdAt?: Date | string
    status: string
    engagement?: string | null
    fileKey?: string | null
    originalName?: string | null
    mimeType?: string | null
    size?: number | null
    resultJson?: NullableJsonNullValueInput | InputJsonValue
    userIdentifier?: string | null
  }

  export type ScanUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: StringFieldUpdateOperationsInput | string
    engagement?: NullableStringFieldUpdateOperationsInput | string | null
    fileKey?: NullableStringFieldUpdateOperationsInput | string | null
    originalName?: NullableStringFieldUpdateOperationsInput | string | null
    mimeType?: NullableStringFieldUpdateOperationsInput | string | null
    size?: NullableIntFieldUpdateOperationsInput | number | null
    resultJson?: NullableJsonNullValueInput | InputJsonValue
    userIdentifier?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type ScanUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: StringFieldUpdateOperationsInput | string
    engagement?: NullableStringFieldUpdateOperationsInput | string | null
    fileKey?: NullableStringFieldUpdateOperationsInput | string | null
    originalName?: NullableStringFieldUpdateOperationsInput | string | null
    mimeType?: NullableStringFieldUpdateOperationsInput | string | null
    size?: NullableIntFieldUpdateOperationsInput | number | null
    resultJson?: NullableJsonNullValueInput | InputJsonValue
    userIdentifier?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type UserQuotaCreateInput = {
    id?: string
    userIdentifier: string
    freeScansUsed?: number
    paidCredits?: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UserQuotaUncheckedCreateInput = {
    id?: string
    userIdentifier: string
    freeScansUsed?: number
    paidCredits?: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UserQuotaUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userIdentifier?: StringFieldUpdateOperationsInput | string
    freeScansUsed?: IntFieldUpdateOperationsInput | number
    paidCredits?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserQuotaUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userIdentifier?: StringFieldUpdateOperationsInput | string
    freeScansUsed?: IntFieldUpdateOperationsInput | number
    paidCredits?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserQuotaCreateManyInput = {
    id?: string
    userIdentifier: string
    freeScansUsed?: number
    paidCredits?: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UserQuotaUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    userIdentifier?: StringFieldUpdateOperationsInput | string
    freeScansUsed?: IntFieldUpdateOperationsInput | number
    paidCredits?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserQuotaUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    userIdentifier?: StringFieldUpdateOperationsInput | string
    freeScansUsed?: IntFieldUpdateOperationsInput | number
    paidCredits?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StripePaymentCreateInput = {
    id?: string
    sessionId: string
    userIdentifier: string
    amountCents: number
    status?: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type StripePaymentUncheckedCreateInput = {
    id?: string
    sessionId: string
    userIdentifier: string
    amountCents: number
    status?: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type StripePaymentUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    sessionId?: StringFieldUpdateOperationsInput | string
    userIdentifier?: StringFieldUpdateOperationsInput | string
    amountCents?: IntFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StripePaymentUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    sessionId?: StringFieldUpdateOperationsInput | string
    userIdentifier?: StringFieldUpdateOperationsInput | string
    amountCents?: IntFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StripePaymentCreateManyInput = {
    id?: string
    sessionId: string
    userIdentifier: string
    amountCents: number
    status?: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type StripePaymentUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    sessionId?: StringFieldUpdateOperationsInput | string
    userIdentifier?: StringFieldUpdateOperationsInput | string
    amountCents?: IntFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StripePaymentUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    sessionId?: StringFieldUpdateOperationsInput | string
    userIdentifier?: StringFieldUpdateOperationsInput | string
    amountCents?: IntFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type IntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }
  export type JsonNullableFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type ScanCountOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    status?: SortOrder
    engagement?: SortOrder
    fileKey?: SortOrder
    originalName?: SortOrder
    mimeType?: SortOrder
    size?: SortOrder
    resultJson?: SortOrder
    userIdentifier?: SortOrder
  }

  export type ScanAvgOrderByAggregateInput = {
    size?: SortOrder
  }

  export type ScanMaxOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    status?: SortOrder
    engagement?: SortOrder
    fileKey?: SortOrder
    originalName?: SortOrder
    mimeType?: SortOrder
    size?: SortOrder
    userIdentifier?: SortOrder
  }

  export type ScanMinOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    status?: SortOrder
    engagement?: SortOrder
    fileKey?: SortOrder
    originalName?: SortOrder
    mimeType?: SortOrder
    size?: SortOrder
    userIdentifier?: SortOrder
  }

  export type ScanSumOrderByAggregateInput = {
    size?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type IntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }
  export type JsonNullableWithAggregatesFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableWithAggregatesFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedJsonNullableFilter<$PrismaModel>
    _max?: NestedJsonNullableFilter<$PrismaModel>
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type UserQuotaCountOrderByAggregateInput = {
    id?: SortOrder
    userIdentifier?: SortOrder
    freeScansUsed?: SortOrder
    paidCredits?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserQuotaAvgOrderByAggregateInput = {
    freeScansUsed?: SortOrder
    paidCredits?: SortOrder
  }

  export type UserQuotaMaxOrderByAggregateInput = {
    id?: SortOrder
    userIdentifier?: SortOrder
    freeScansUsed?: SortOrder
    paidCredits?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserQuotaMinOrderByAggregateInput = {
    id?: SortOrder
    userIdentifier?: SortOrder
    freeScansUsed?: SortOrder
    paidCredits?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserQuotaSumOrderByAggregateInput = {
    freeScansUsed?: SortOrder
    paidCredits?: SortOrder
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type StripePaymentCountOrderByAggregateInput = {
    id?: SortOrder
    sessionId?: SortOrder
    userIdentifier?: SortOrder
    amountCents?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type StripePaymentAvgOrderByAggregateInput = {
    amountCents?: SortOrder
  }

  export type StripePaymentMaxOrderByAggregateInput = {
    id?: SortOrder
    sessionId?: SortOrder
    userIdentifier?: SortOrder
    amountCents?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type StripePaymentMinOrderByAggregateInput = {
    id?: SortOrder
    sessionId?: SortOrder
    userIdentifier?: SortOrder
    amountCents?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type StripePaymentSumOrderByAggregateInput = {
    amountCents?: SortOrder
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type NullableIntFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type NestedFloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }
  export type NestedJsonNullableFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<NestedJsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>,
        Required<NestedJsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>

  export type NestedJsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}