import { ChangeDetectionStrategy, ChangeDetectorRef, Component, HostListener, linkedSignal, signal, ViewChild } from '@angular/core';
import { GithubService } from '../../core/github.service';
import { FormsModule } from '@angular/forms';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { Router } from '@angular/router';
import { MatRadioModule } from '@angular/material/radio';
import { from, Observable } from 'rxjs';
import { StorageWithExpiryService } from '../../core/storage-with-expiry.service';
import { SearchFormComponent } from '../../shared/components/search-form/search-form.component';
import { Repository } from '../../shared/models/repository.model';
import { SearchModel } from '../../shared/models/search.model';
import { DatePipe } from '@angular/common';

const STORAGE_KEY = 'github-search';

@Component({
  selector: 'app-repos',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    DatePipe,
    MatTableModule,
    MatInputModule,
    MatButtonModule,
    MatSortModule,
    MatRadioModule,
    MatIconModule,
    SearchFormComponent,
    MatCardModule,
    MatProgressBarModule,
    MatFormFieldModule],
  templateUrl: './repos.component.html',
  styleUrl: './repos.component.css'
})
export class ReposComponent {
  @ViewChild(MatSort) sort!: MatSort;

  searchMode = signal('byName');
  query = signal('');
  language = signal('');
  minStars = signal(0);

  loading = signal(false);
  page = signal(1);
  perPage = 30;
  hasMore = signal(true);

  allRepos = signal<Repository[]>([]);
  dataSource = new MatTableDataSource<Repository>([]);

  // Signal linked to construct the complete search query
  // Combines search criteria: name, language, and minimum stars
  fullQuery = linkedSignal(() => {
    let q = this.query().trim();
    if (this.language()) q += ` language:${this.language()}`;
    if (this.minStars()) q += ` stars:>=${this.minStars()}`;
    return q;
  });

  displayedColumns = ['index', 'avatar', 'name', 'created_at'];

  constructor(private github: GithubService, private cdr: ChangeDetectorRef, private router: Router, private storageService: StorageWithExpiryService) { }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }

  onQueryChange(value: string) {
    this.query.set(value);
  }

  onLanguageChange(value: string) {
    this.language.set(value);
  }

  onMinStarsChange(value: number) {
    this.minStars.set(value);
  }

  handleSearch(data: SearchModel) {
    this.searchMode.set(data.searchMode);
    this.query.set(data.query);
    this.language.set(data.language);
    this.minStars.set(data.minStars);
    this.search();
  }

  // Main search method
  // - Resets results if "reset" is true
  // - Uses RxJS to handle pagination and API responses
  search(reset: boolean = true) {
    if (this.loading()) return; // Prevents simultaneous searches

    if (reset) {
      this.allRepos.set([]); // Resets the results
      this.page.set(1); // Resets pagination
      this.hasMore.set(true);
    }

    this.loading.set(true); // Activates the loader

    try {
      let response$: Observable<Repository[]>;

      if (this.searchMode() === 'byName') {
        response$ = from(this.github.searchRepositoriesPerPage(this.fullQuery(), this.page(), this.perPage));
      } else {
        response$ = this.github.searchRepositoriesByIssueTitlePerPage(this.fullQuery(), this.page(), this.perPage);
      }

      // Subscribes to the RxJS observable to handle results
      response$.subscribe({
        next: (response) => {
          const newItems = response;
          if (newItems.length < this.perPage) {
            this.hasMore.set(false); // Disables infinite scrolling if no more results
          }

          // Updates the retrieved repositories
          this.allRepos.update(prev => [...prev, ...newItems]);
          this.dataSource.data = this.allRepos();
          this.dataSource.sort = this.sort;

          this.page.update(p => p + 1); // Moves to the next page
        },
        error: (err) => {
          console.error('Search error:', err); // Logs errors
          this.hasMore.set(false);
        },
        complete: () => {
          this.loading.set(false); // Deactivates the loader
        }
      });
    } catch (err) {
      console.error('Search error:', err);
    }
  }

  // Infinite Scroll
  @HostListener('window:scroll', [])
  onScroll(): void {
    if (this.hasMore() && !this.loading()) {
      const threshold = 300;
      const position = window.innerHeight + window.scrollY;
      const height = document.body.scrollHeight;
      if (position >= height - threshold) {
        const query = this.fullQuery?.()?.trim();
        if (query) {
          this.search(false);
        }
      }
    }
  }

  goToCommits(repo: Repository) {
    const searchData = {
      searchMode: this.searchMode(),
      query: this.query(),
      language: this.language(),
      minStars: this.minStars(),
    };
    this.storageService.setItem(STORAGE_KEY, searchData, 15 * 60 * 1000);

    const owner = repo.owner.login;
    const name = repo.name;
    this.router.navigate(['/commits', owner, name]);
  }
}
