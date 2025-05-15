import { Injectable } from '@angular/core';
import { Octokit } from '@octokit/rest';
import { environment } from '../../environments/environments';
import { catchError, forkJoin, from, map, Observable, of, switchMap } from 'rxjs';
import { Commit } from '../models/commit.model';
import { Repository } from '../models/repository.model';

@Injectable({
  providedIn: 'root',
})
export class GithubService {

  private octokit = new Octokit({
    auth: environment.githubToken,
  });

  constructor() { }

  searchRepositories(query: string) {
    return this.octokit.rest.search.repos({
      q: query,
      sort: 'stars',
      order: 'desc',
      per_page: 10,
    });
  }

  searchRepositoriesPerPage(query: string, page = 1, per_page = 30):Observable <Repository[]> {
    return from(
      this.octokit.rest.search.repos({
        q: query,
        sort: 'stars',
        order: 'desc',
        page,
        per_page,
      })
    ).pipe(
      map((response) =>
        response.data.items.map((repo) => ({
          id: repo.id,
          full_name: repo.full_name,
          name:repo.name,
          description: repo.description,
          language: repo.language,
          stargazers_count: repo.stargazers_count,
          html_url: repo.html_url,
          created_at:repo.created_at,
          owner: {
            login: repo?.owner?.login ?? '',
            avatar_url: repo?.owner?.avatar_url ?? '',
            html_url: repo?.owner?.html_url ?? '',
          },
        }))
      )
    );
  }

  getCommits(owner: string, repo: string) {
    return this.octokit.rest.repos.listCommits({
      owner,
      repo,
      per_page: 10,
    });
  }

  getCommitsPerPage(owner: string, repo: string, page = 1, per_page = 30): Observable<Commit[]> {
    return from(this.octokit.rest.repos.listCommits({
      owner,
      repo,
      per_page,
      page
    })).pipe(map((response) => response.data.map(item => ({
      authorName: item.commit.author?.name || item.author?.login || "Unknown",
      message: item.commit.message,
      url: item.html_url
    }))));
  }

  searchRepositoriesByIssueTitle(query: string) {
    return this.octokit.rest.search.issuesAndPullRequests({
      q: `${query} in:title type:issue`,
      page: 1,
      per_page: 30
    });
  }

  searchRepositoriesByIssueTitlePerPage(query: string, page = 1, per_page = 30): Observable<Repository[]> {
    return from(
      this.octokit.rest.search.issuesAndPullRequests({
        q: `${query} in:title type:issue`,
        page,
        per_page,
      })
    ).pipe(
      map((result) =>
        Array.from(
          new Set(result.data.items.map((item) => item.repository_url))
        )
      ),
      switchMap((repoUrls) => {
        if (repoUrls.length === 0) return of([]);
        const repoRequests = repoUrls.map((url) =>
          from(this.octokit.request(`GET ${url}`)).pipe(
            map((res) => res.data),
            catchError(() => of(null))
          )
        );
        return forkJoin(repoRequests);
      })
    );
  }

}
