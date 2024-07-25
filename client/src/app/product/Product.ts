import { Category } from './Category';
import { Variant } from './Variant';

export class Product {
  id!: number;
  title!: string;
  description!: string;
  category!: Category;
  base_price!: number;
  variants!: Variant[];
}
