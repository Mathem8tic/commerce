import { User } from '../auth/User';
import { PriceGroup } from './PriceGroup';
import { Product } from './Product';

export class UserPricing {
  id!: number;
  user!: User;
  product!: Product;
  price_group!: PriceGroup;
  custom_price!: number;
}
