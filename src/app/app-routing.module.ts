import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { MarqueformComponent } from './marqueform/marqueform.component';
import { MarqueComponent } from './marque/marque.component';
import { VoitureComponent } from './voiture/voiture.component';
import { VoitureformComponent } from './voitureform/voitureform.component';
import { VoituredetailsComponent } from './voituredetails/voituredetails.component';
import { ComparedetailsComponent } from './comparedetails/comparedetails.component';
import { CompareformComponent } from './compareform/compareform.component';
import { HomepageComponent } from './homepage/homepage.component';
import { CarrosserieComponent } from './carrosserie/carrosserie.component';
import { CarrosserieformComponent } from './carrosserieform/carrosserieform.component';
import { authGuard } from './auth.guard';


import { DashboardvusComponent } from './dashboardvus/dashboardvus.component';
import { DashboardfavorisComponent } from './dashboardfavoris/dashboardfavoris.component';
import { DashboardcomparisonsComponent } from './dashboardcomparisons/dashboardcomparisons.component';

// [() => authGuard()] // Anyone logged in can access
// [() => authGuard('admin')]
// [() => authGuard('user')] // USER AND IS NOT ADMIN

const routes: Routes = [
  {
    path:'',
    redirectTo: '/home',
    pathMatch: 'full'
  },
  {
    path:'admin',
    redirectTo: '/admin/list-voitures',
    pathMatch: 'full'
  },
  {
    path:'dashboard',
    redirectTo: '/dashboard/vus',
    pathMatch: 'full'
  },
  {
    path:'home',
    pathMatch: 'full',
    component: HomepageComponent
  },
  {
    path:'login',
    pathMatch: 'full',
    component: LoginComponent
  },
  {
    path:'register',
    pathMatch: 'full',
    component: RegisterComponent
  },
  {
    path:'voiture-details',
    canActivate:  [() => authGuard('')],
    component: VoituredetailsComponent
  },
  {
    path:'comparer',
    canActivate:  [() => authGuard('')],
    component: CompareformComponent
  },
  {
    path:'comparison-result',
    canActivate:  [() => authGuard('')],
    component: ComparedetailsComponent
  },
  {
    path:'admin/ajouter-marque',
    canActivate:  [() => authGuard('admin')],
    component: MarqueformComponent
  },
  {
    path:'admin/list-marques',
    canActivate:  [() => authGuard('admin')],
    component: MarqueComponent
  },
  {
    path:'admin/list-voitures',
    canActivate:  [() => authGuard('admin')],
    component: VoitureComponent
  },
  {
    path:'admin/ajouter-voiture',
    canActivate:  [() => authGuard('admin')],
    component: VoitureformComponent
  },
  {
    path:'admin/ajouter-carrosserie',
    canActivate:  [() => authGuard('admin')],
    component: CarrosserieformComponent
  },
  {
    path:'admin/list-carrosseries',
    canActivate:  [() => authGuard('admin')],
    component: CarrosserieComponent
  },
  {
    path:'dashboard/vus',
    canActivate:  [() => authGuard('')], //user
    component: DashboardvusComponent
  },
  {
    path:'dashboard/favoris',
    canActivate:  [() => authGuard('')], //user
    component: DashboardfavorisComponent
  },
  {
    path:'dashboard/comparisons',
    canActivate:  [() => authGuard('')], //user
    component: DashboardcomparisonsComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
