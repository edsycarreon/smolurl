export class ApiResponse<T> {
  constructor(
    public readonly code: number,
    public readonly message: string,
    public readonly data?: T,
  ) {}
}
