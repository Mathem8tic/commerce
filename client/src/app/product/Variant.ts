import { Product } from "./Product";

export class Variant {
  id!: number;
  product!: Product;
  title!: string;
  additional_price!: number;
}
