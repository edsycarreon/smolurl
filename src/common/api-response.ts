export class ApiResponse<T> {
  constructor(
    public readonly status: number,
    public readonly code: string,
    public readonly message: string,
    public readonly data?: T,
  ) {}
}
