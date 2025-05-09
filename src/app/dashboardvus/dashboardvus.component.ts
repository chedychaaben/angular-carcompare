import { Component, OnInit } from '@angular/core';
import { Chart, ChartDataset, ChartOptions, registerables } from 'chart.js';
import { AngularFireAuth } from '@angular/fire/compat/auth';

import { Vu } from 'src/Models/Vu';
import { Favori } from 'src/Models/Favori';
import { Comparison } from 'src/Models/Comparison';
import { Voiture } from 'src/Models/Voiture';

import { VuService } from '../services/vu.service';
import { VoitureService } from '../services/voiture.service';



type VoitureWithExtras = Voiture & {
  marque_nom?: string;
  carrosserie_nom?: string;
};

export interface ComparisonWithCars extends Comparison {
  voitureUne?: VoitureWithExtras;
  voitureDeux?: VoitureWithExtras;
}

Chart.register(...registerables);

@Component({
  selector: 'app-dashboardvus',
  templateUrl: './dashboardvus.component.html',
  styleUrls: ['./dashboardvus.component.css']
})
export class DashboardvusComponent implements OnInit{
  today: Date = new Date();
  vus : Vu[] = [];
  favoris : Favori[] = [];
  comparisons : ComparisonWithCars[] = [];
  voitures : VoitureWithExtras[] = [];
  newestVu: Vu | null = null;
  newestVoiture: VoitureWithExtras | null = null;

  
  constructor(
    private afAuth: AngularFireAuth,
    private vuService: VuService,
    private voitureService: VoitureService,
  ) {}
  ngOnInit() {
    this.afAuth.authState.subscribe(user => {
      if (user) {
        // First get all voitures
        this.voitureService.GetAllVoitures().subscribe((data) => {
          this.voitures = data;
  
          // Now get the VUs by UserId
          this.vuService.GetVusByUserId(user.uid).subscribe((vusData) => {
            this.vus = vusData;
  
            // Get the newest vu
            const newestVu = this.vus.sort((a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime())[0];
            this.newestVu = newestVu;
  
            // Get the voiture of the newest vu
            this.newestVoiture = this.voitures.find(voiture => voiture.id === newestVu.voitureid) || null;
            
            this.updateViewingChart();
            this.updateViewedMarquesChart();
          });
        });
      }
    });
  }
  
  getLastNDaysLabels(n: number): string[] {
    const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

    const result: string[] = [];
    const today = new Date();
  
    for (let i = n-1; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      result.push(days[date.getDay()]);
    }
  
    return result;
  }

  // INIT
  viewingTrendsData: ChartDataset[] = [
    {
      label: 'Votre historique de visualisation par jour (derniers 7 jours)',
      data: []
    }
  ];
  viewingTrendsLabels: string[] = this.getLastNDaysLabels(7);
  viewingTrendsOptions: ChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: true
      }
    }
  };

  // INIT
  ViewedMarquesData: ChartDataset[] = [];
  ViewedMarquesLabels: string[] = [];
  ViewedMarquesOptions: ChartOptions = {
    indexAxis: 'y',
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Marques de voitures vues' }
    }
  };


  // TREAT
  getStartOfCurrentWeek(): Date {
    const now = new Date();
    const day = now.getDay(); // 0 (Sun) - 6 (Sat)
    const diff = now.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is Sunday
    return new Date(now.setDate(diff));
  }
  processDayCounts(rawData: Vu[]): { labels: string[], data: number[] } {
    const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    const countMap = new Map<string, number>();
  
    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 6); // includes today
  
    rawData.forEach(item => {
      const dateObj = new Date(item.datetime);
      // keep only items within the last 7 days
      if (dateObj >= sevenDaysAgo && dateObj <= today) {
        const dayName = days[dateObj.getDay()];
        countMap.set(dayName, (countMap.get(dayName) || 0) + 1);
      }
    });
  
    const labels = this.getLastNDaysLabels(7);
    const data = labels.map(day => countMap.get(day) || 0);
    return { labels, data };
  }
  
  updateViewingChart() {
    
    const result = this.processDayCounts(this.vus);
  
    this.viewingTrendsLabels = result.labels;
    this.viewingTrendsData = [
      {
        label: 'Votre historique de visualisation par jour (derniers 6 jours)',
        data: result.data,
        fill: false,
        borderColor: '#42A5F5',
        tension: 0.3,
      }
    ];
  }

  // TREAT
  updateViewedMarquesChart() {
    const marqueCounts: { [marque_nom: string]: number } = {};
  
    this.vus.forEach(vu => {
      const voiture = this.voitures.find(v => v.id === vu.voitureid);
      if (voiture) {const marque = voiture.marque_nom || 'Unknown';
        marqueCounts[marque] = (marqueCounts[marque] || 0) + 1;
      }
    });
  
    // Convert to array of [marque, count], sort, and slice top 5
    const sortedMarques = Object.entries(marqueCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

    const labels = sortedMarques.map(([marque_nom]) => marque_nom);
    const data = sortedMarques.map(([, count]) => count);
  
    this.ViewedMarquesLabels = labels;
    this.ViewedMarquesData = [{
      label: 'Vues par marque',
      data: data,
      backgroundColor: '#36a2eb'
    }];
  }


}
