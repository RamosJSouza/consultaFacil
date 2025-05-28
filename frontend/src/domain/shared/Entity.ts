export abstract class Entity<T> {
  protected readonly props: T;
  private readonly _id: string;

  constructor(props: T, id?: string) {
    this.props = props;
    this._id = id || crypto.randomUUID();
  }

  get id(): string {
    return this._id;
  }

  public equals(object?: Entity<T>): boolean {
    if (object === null || object === undefined) {
      return false;
    }

    if (this === object) {
      return true;
    }

    if (!(object instanceof Entity)) {
      return false;
    }

    return this._id === object._id;
  }
} 