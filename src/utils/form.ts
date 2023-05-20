import { classValidatorResolver } from "@hookform/resolvers/class-validator";
import { ClassConstructor } from "class-transformer";

export function getClassValidatorResolver<
  T extends {
    [_: string]: any;
  }
>(c: ClassConstructor<T>) {
  return classValidatorResolver(c);
}
