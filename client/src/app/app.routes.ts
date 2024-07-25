import { Routes } from '@angular/router';
import { MessageListComponent } from './message/message-list/message-list.component';
import { AuthGuard } from './guards/auth.guard';
import { HomeComponent } from './home/home/home.component';
import { UserProfileComponent } from './user/user-profile/user-profile.component';
import { ProductListComponent } from './product/product-list/product-list.component';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'messages', component: MessageListComponent, canActivate: [AuthGuard] },
    { path: 'user', component: UserProfileComponent },
    { path: 'products', component: ProductListComponent },
  ];