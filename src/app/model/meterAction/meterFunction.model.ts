// type FunctionType = "READ_CLOCK" | "OTHER_FUNCTION_TYPE"; // Extend with additional types as needed

interface MeterFunction {
  obisCode: string;
  functionType: string;
}
export class MeterRequest {
  meterIds: number[] = [];
  functions: MeterFunction[] = [];

  constructor(
    initialMeterIds: number[] = [],
    initialFunctions: MeterFunction[] = []
  ) {
    this.meterIds = initialMeterIds;
    this.functions = initialFunctions;
  }

  // Add a meter ID
  addMeterId(meterId: number): void {
    if (!this.meterIds.includes(meterId)) {
      this.meterIds.push(meterId);
    }
  }

  // Remove a meter ID
  removeMeterId(meterId: number): void {
    this.meterIds = this.meterIds.filter(id => id !== meterId);
  }

  // Add a function
  addFunction(obisCode: string, functionType: string): void {
    this.functions.push({ obisCode, functionType });
  }

  // Remove a function by obisCode
  removeFunction(obisCode: string): void {
    this.functions = this.functions.filter(func => func.obisCode !== obisCode);
  }

  // Get the object
  getRequestObject(): { meterIds: number[]; functions: MeterFunction[] } {
    return {
      meterIds: this.meterIds,
      functions: this.functions,
    };
  }
}
