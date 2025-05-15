import { Component, Output, EventEmitter, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonModule } from '@angular/material/button';
import { StorageWithExpiryService } from '../../../core/storage-with-expiry.service';
import { SearchModel } from '../../models/search.model';

const STORAGE_KEY = 'github-search';

@Component({
  selector: 'search-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatInputModule,
    MatRadioModule,
    MatButtonModule
  ],
  templateUrl: './search-form.component.html',
  styleUrl: './search-form.component.css'
})
export class SearchFormComponent implements OnInit {
  form!: FormGroup;

  @Output() search = new EventEmitter<SearchModel>();

  constructor(private fb: FormBuilder, private storageService: StorageWithExpiryService) { }

  ngOnInit(): void {
    const saved = this.storageService.getItem(STORAGE_KEY);
    if (saved) {
      this.form = this.fb.group({
        searchMode: [saved.searchMode || 'byName'],
        query: [saved.query || '', Validators.required],
        language: [saved.language || ''],
        minStars: [saved.minStars || 0]
      });
      this.search.emit(this.form.value);
    } else {
      this.form = this.fb.group({
        searchMode: ['byName'],
        query: ['', Validators.required],
        language: [''],
        minStars: [0]
      });
    }
  }


  onSubmit() {
    if (this.form.valid) {
      this.search.emit(this.form.value);
    }
  }

  get searchMode() {
    return this.form.get('searchMode')?.value;
  }
}
