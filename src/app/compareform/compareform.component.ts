import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { VoitureService } from '../services/voiture.service';
import { CarrosserieService } from 'src/app/services/carrosserie.service';
import { CompareService } from '../services/compare.service';
import { MarqueService } from '../services/marque.service';
import { AuthService } from 'src/app/services/auth.service';
import { Voiture } from 'src/Models/Voiture';
import { Comparison } from 'src/Models/Comparison';
import { HttpClient } from '@angular/common/http';

type VoitureWithExtras = Voiture & {
  marque_nom?: string;
  carrosserie_nom?: string;
};

@Component({
  selector: 'app-compareform',
  templateUrl: './compareform.component.html',
  styleUrls: ['./compareform.component.css']
})
export class CompareformComponent implements OnInit {
  isLoading = true;
  searchForm!: FormGroup;
  filteredModels: string[] = [];
  voitureOneId: string | null = null;
  marques: any[] = [];
  carrosseries: any[] = [];
  voitures: VoitureWithExtras[] = [];
  latestVoitures: VoitureWithExtras[] = [];
  carOne: VoitureWithExtras | null = null;
  userId!: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private voitureService: VoitureService,
    private carrosserieService: CarrosserieService,
    private marqueService: MarqueService,
    private compareService: CompareService,
    private authService: AuthService,
    private http: HttpClient
  ) {}

  ngOnInit() {

    this.userId = this.authService.getUserId()!;

    this.route.paramMap.subscribe(params => {
      this.voitureOneId = params.get('voiture1');
      if (!this.voitureOneId) {
        this.route.queryParamMap.subscribe(queryParams => {
          this.voitureOneId = queryParams.get('voiture1');
          this.fetchCar(this.voitureOneId ?? "");
        });
      }
    });
  
    this.searchForm = this.fb.group({
      id: '',
      marque: '',
      carrosserie: '',
      model: ''
    });
  
    // Fetch all voitures first, then check if voitureOneId exists
    this.voitureService.GetAllVoitures().subscribe(data => {
      this.voitures = data;
      
      // Check if voitureOneId exists in voitures list
      const exists = this.voitures.some(v => v.id === this.voitureOneId);
      if (!exists) {
        console.error('Error 404: Car not found');
        this.router.navigate(['/']); // Redirect to a home page
      }
    });
  
    this.marqueService.GetAllMarques().subscribe(data => (this.marques = data));
    this.carrosserieService.GetAllCarrosseries().subscribe(data => (this.carrosseries = data));
    this.voitureService.getLatestVoitures().subscribe(data => (this.latestVoitures = data));
  
    // Listen to form changes
    this.searchForm.get('marque')?.valueChanges.subscribe(selectedMarqueId => {
      const selectedCarrosrieId = this.searchForm.get('carrosserie')?.value;
      this.filterModels(selectedCarrosrieId, selectedMarqueId);
    });
  
    this.searchForm.get('carrosserie')?.valueChanges.subscribe(selectedCarrosrieId => {
      const selectedMarqueId = this.searchForm.get('marque')?.value;
      this.filterModels(selectedCarrosrieId, selectedMarqueId);
    });
  }
  
  

  filterModels(selectedCarrosrieId: string, selectedMarqueId: string): void {
    if (!selectedMarqueId || !selectedCarrosrieId) {
      this.filteredModels = [];
      return;
    }

    this.filteredModels = this.voitures
      .filter(voiture => voiture.marque === selectedMarqueId && voiture.carrosserie === selectedCarrosrieId)
      .map(voiture => voiture.model);
  }

  onSearch() {
    const { id, marque, carrosserie, model } = this.searchForm.value;
  
    // Find the selected car from the voitures array based on marque, carrosserie, and model
    const selectedCar = this.voitures.find(
      v => v.marque === marque && v.carrosserie === carrosserie && v.model === model
    );
  
    if (selectedCar) {
      const compareData: Comparison = {
        voitureuneid: this.voitureOneId as string,
        voituredeuxid: selectedCar.id as string,
        userid: this.userId,
        datetime: new Date()
      };
      
      // Add the comparison to the database
      this.compareService.AddComparison(compareData).subscribe((response: any) => {
        console.log('Comparison added successfully');
        if (response?.id) {
          // Navigate to the comparison result page with the comparison ID as query parameter
          this.router.navigate(['/comparison-result'], { queryParams: { id: response.id } });
        } else {
          console.warn('No ID returned from the server');
        }
      });
    } else {
      console.warn('No matching car found!');
    }
  }

  
  fetchCar(id: string): void {
    this.voitureService.getVoitureById(id).subscribe(car1 => {
      this.carOne = car1;
      this.isLoading = false;
    });
  }
}