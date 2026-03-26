export type SqlQuery = {
  text: string;
  values?: unknown[];
};

export interface SqlClient {
  query<T = unknown>(query: SqlQuery): Promise<{ rows: T[] }>;
}
