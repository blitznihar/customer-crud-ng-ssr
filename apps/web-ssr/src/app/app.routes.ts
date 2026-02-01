import { Routes } from '@angular/router';
import { Home } from './home/home';
import {CreateCustomers} from './createcustomers/createcustomers';
import { Customers } from './customers/customers';



export const routes: Routes = [
  { path: '', component: Home },
  {path:'customers', component: Customers},
  {path:'createcustomers', component: CreateCustomers}

];
