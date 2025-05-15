import { Component, HostListener, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GithubService } from '../../core/github.service';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { RecursiveFilterPipe } from '../../shared/pipes/recursive-filter.pipe';
import { FormsModule } from '@angular/forms';
import { Commit } from '../../shared/models/commit.model';

@Component({
  selector: 'app-commits',
  imports: [MatTableModule,FormsModule,MatFormFieldModule,RecursiveFilterPipe, MatInputModule,MatProgressBarModule, MatIconModule, MatTooltipModule],
  templateUrl: './commits.component.html',
  styleUrl: './commits.component.css'
})
export class CommitsComponent {
  commits = signal<Commit[]>([]);
  dataSource = new MatTableDataSource<Commit>();
  displayedColumns = ['author', 'message', 'url'];
  repo = '';
  owner = '';
  
  page = 1; 
  perPage = 30;
  loading = signal(false);
  hasMore = signal(true);
  searchText=signal("");

  constructor(private route: ActivatedRoute, private github: GithubService, private router: Router) {}

  ngOnInit() {
    this.owner = this.route.snapshot.paramMap.get('owner')!;
    this.repo = this.route.snapshot.paramMap.get('repo')!;
    this.loadCommits(); // load the first page of commits
  }

  // Method to load commits from the GitHub API
  loadCommits() {
    if (this.loading()) return; // Prevent multiple simultaneous requests
    this.loading.set(true);
    
    try {
      this.github.getCommitsPerPage(this.owner, this.repo, this.page, this.perPage).subscribe({
        next: (response) => {
          const newCommits = response;
          if (newCommits.length < this.perPage) {
            this.hasMore.set(false);
          }
          const currentCommits = this.commits();
          this.commits.set([...currentCommits, ...newCommits]);
          this.dataSource.data = this.commits();
          this.page++;
        }
      })
     
    } catch (err) {
      console.error('Error loading commits:', err);
    } finally {
      this.loading.set(false);
    }
  }

  // Filter method for searching commits
  applyFilter(event: KeyboardEvent) {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.searchText.set(filterValue);
    this.dataSource.filter = filterValue;
  }

  // Navigate back to the Repos page
  goBack() {
    this.router.navigate(['/repos']);
  }

  // Infinite scroll listener
  @HostListener('window:scroll', [])
  onScroll(): void {
    if (this.hasMore() && !this.loading()) {
      const threshold = 300; // Trigger scroll load when 300px from the bottom
      const position = window.innerHeight + window.scrollY;
      const height = document.body.scrollHeight;
      if (position >= height - threshold) {
        this.loadCommits();
      }
    }
  }
}
