export class ModelOperation {
  _modelHeader!: string;
  _isEdit!: boolean;
  _object:any

  constructor(modelHeader:string , isEdit:boolean, object:any) {
    this._modelHeader = modelHeader;
    this._isEdit = isEdit;
    this._object = object;
  }
  public get modelHeader() : string {
    return this._modelHeader;
   }
}
