import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'recursiveFilter',
  pure: false
})
export class RecursiveFilterPipe implements PipeTransform {
  transform(items: any[], searchText: string): any[] {
    if (!items || !searchText) {
      return items;
    }
    searchText = searchText.toLowerCase();
    return this.filterItems(items, searchText);
  }

  private filterItems(items: any[], searchText: string): any[] {
    return items.filter(item => {
      return this.recursiveSearch(item, searchText);
    });
  }

  private recursiveSearch(item: any, searchText: string): boolean {
    if (typeof item === 'string') {
      return item.toLowerCase().includes(searchText);
    }

    if (Array.isArray(item)) {
      return item.some(i => this.recursiveSearch(i, searchText));
    }

    if (typeof item === 'object' && item !== null) {
      return Object.values(item).some(val => this.recursiveSearch(val, searchText));
    }

    return false;
  }
}
