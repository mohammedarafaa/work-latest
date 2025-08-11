export class paging_$Searching {
  page: number;
  size: number;
  sort: string | string[];
  sortDirection: string;
  name: string;
  nameAr: string;
  title: string;
  search: string;
  constructor() {
    this.page = 0;
    this.size = 8;
    this.sort = '';
    this.sortDirection = 'asc';
    this.name = '';
    this.nameAr = '';
    this.search = '';
    this.title = '';
  }
  public get _page(): number {
    return this.page - 1;
  }

  public set _size(size: number) {
    this.size = size;
  }
}


export class DataTableActions {
  isDisable: boolean = true;
  type: string = '';
  constructor(type: string) {
    this.type = type;

  }

}
export class ExportDto {
  isExported: boolean = false;
  columnList!: { [key: string]: boolean } | null;


}


export interface DataTableResponse<t> {
  status: number
  message: string
  data: DataTable<t>
  errors: any
}

export interface DataTable <t> {
  content: t[]
  pageable: Pageable
  last: boolean
  totalPages: number
  totalElements: number
  first: boolean
  size: number
  number: number
  sort: Sort2
  numberOfElements: number
  empty: boolean
}

export interface Pageable {
  pageNumber: number
  pageSize: number
  sort: Sort
  offset: number
  paged: boolean
  unpaged: boolean
}

export interface Sort {
  empty: boolean
  sorted: boolean
  unsorted: boolean
}

export interface Sort2 {
  empty: boolean
  sorted: boolean
  unsorted: boolean
}
