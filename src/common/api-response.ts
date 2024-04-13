export class ApiResponse<T> {
  constructor(
    public readonly status: number,
    public readonly message: string,
    public readonly data?: T,
  ) {}
}
